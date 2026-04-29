import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "https://esm.sh/web-push@3.6.7";

const VAPID_PUBLIC_KEY = Deno.env.get("NEXT_PUBLIC_VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;

webpush.setVapidDetails(
  "mailto:soporte@metodostack.com",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, push_subscription")
    .not("push_subscription", "is", null);

  if (!profiles) return new Response("No users found", { status: 200 });

  const now = new Date();
  // Assume server might be in UTC, typical "8 PM" in Latam is around 01:00 UTC next day
  const hour = now.getUTCHours();
  
  // Decide message type (you can also pass ?type=noon or ?type=night in the URL)
  const url = new URL(req.url);
  const typeParam = url.searchParams.get("type");
  
  // Logical default based on hour if no param
  const isNight = typeParam === "night" || (hour >= 23 || hour <= 4);

  console.log(`Ejecutando reporte tipo: ${isNight ? 'NOCHE' : 'MEDIODIA'} para ${profiles.length} usuarios...`);

  const todayStr = now.toISOString().split("T")[0];

  for (const profile of profiles) {
    try {
      const { data: habits } = await supabase
        .from("habits")
        .select("id, name, created_at, archived_at")
        .eq("user_id", profile.id);

      const { data: completions } = await supabase
        .from("completions")
        .select("habit_id")
        .eq("user_id", profile.id)
        .eq("date", todayStr);

      const activeHabits = habits?.filter((h: any) => {
        const created = new Date(h.created_at);
        if (created > now) return false;
        if (!h.archived_at) return true;
        return new Date(h.archived_at) > now;
      }) || [];

      if (activeHabits.length === 0) continue;

      const completedIds = new Set(completions?.map((c: any) => c.habit_id));
      const X = activeHabits.filter((h: any) => completedIds.has(h.id)).length;
      const Y = activeHabits.length;

      let title = "";
      let body = "";

      if (isNight) {
        const pendingNames = activeHabits
          .filter((h: any) => !completedIds.has(h.id))
          .map((h: any) => h.name)
          .join(", ");
        
        title = "🌙 Reporte Final";
        body = `Lograste ${X} de ${Y} hábitos.${pendingNames ? ` Pendientes: ${pendingNames}` : ' ¡Día perfecto!'}`;
      } else {
        title = "☀️ ¡Aún hay tiempo!";
        body = `Progreso de hoy: Has completado ${X} de ${Y} hábitos. ¡Tú puedes!`;
      }

      await webpush.sendNotification(
        profile.push_subscription,
        JSON.stringify({ title, body, url: "/tracker" })
      );
    } catch (err) {
      console.error(`Error en reporte para ${profile.id}:`, err);
    }
  }

  return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
});
