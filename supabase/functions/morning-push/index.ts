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

  console.log(`Procesando ${profiles.length} usuarios...`);

  for (const profile of profiles) {
    try {
      const { data: rawCompletions } = await supabase
        .from("completions")
        .select("date, habit_id")
        .eq("user_id", profile.id)
        .order("date", { ascending: false });

      const { data: habits } = await supabase
        .from("habits")
        .select("id, created_at, archived_at")
        .eq("user_id", profile.id);

      let streak = 0;
      let checkDate = new Date();
      
      while (true) {
        const dStr = checkDate.toISOString().split("T")[0];
        const activeToday = habits?.filter((h: any) => {
           const created = new Date(h.created_at);
           if (created > checkDate) return false;
           if (!h.archived_at) return true;
           return new Date(h.archived_at) > checkDate;
        }) || [];

        if (activeToday.length === 0) break;
        const doneToday = rawCompletions?.filter((c: any) => c.date === dStr).length || 0;
        
        if (doneToday === activeToday.length) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          // If 0 day streak, maybe they didn't do it today but did it yesterday
          if (streak === 0) {
             const yesterday = new Date(checkDate);
             yesterday.setDate(yesterday.getDate() - 1);
             const dStrPrev = yesterday.toISOString().split("T")[0];
             const donePrev = rawCompletions?.filter((c: any) => c.date === dStrPrev).length || 0;
             const activeYesterday = habits?.filter((h: any) => {
                const created = new Date(h.created_at);
                if (created > yesterday) return false;
                if (!h.archived_at) return true;
                return new Date(h.archived_at) > yesterday;
             }) || [];

             if (donePrev < activeYesterday.length || activeYesterday.length === 0) break; 
             else {
               // Start counting from yesterday since today isn't done yet but yesterday was
               checkDate = yesterday;
               continue;
             }
          }
          break; 
        }
      }

      await webpush.sendNotification(
        profile.push_subscription,
        JSON.stringify({
          title: "☕ ¡Momento STACK!",
          body: `Tu racha de ${streak} días te espera. Entra y marca tus hábitos de hoy.`,
          url: "/tracker"
        })
      );
    } catch (err) {
      console.error(`Error con usuario ${profile.id}:`, err);
    }
  }

  return new Response(JSON.stringify({ done: true }), { headers: { "Content-Type": "application/json" } });
});
