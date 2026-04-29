import { 
  BookOpen, 
  Droplets, 
  Moon, 
  Sun, 
  Video, 
  PenTool, 
  Utensils, 
  ShoppingBag, 
  Car, 
  Target,
  Dumbbell,
  Flame,
  Coffee,
  Code
} from 'lucide-react';

export const getHabitIcon = (name: string) => {
  const n = name.toLowerCase();
  const iconClass = "w-3.5 h-3.5 shrink-0";
  
  if (n.includes('biblia') || n.includes('leer') || n.includes('libro')) 
    return <BookOpen className={`${iconClass} text-blue-600`} />;
  if (n.includes('agua') || n.includes('beber') || n.includes('hidrata') || n.includes('tomar')) 
    return <Droplets className={`${iconClass} text-sky-500`} />;
  if (n.includes('dormir') || n.includes('noche') || n.includes('descansar')) 
    return <Moon className={`${iconClass} text-indigo-500`} />;
  if (n.includes('levantar') || n.includes('mañana') || n.includes('temprano')) 
    return <Sun className={`${iconClass} text-amber-500`} />;
  if (n.includes('vivo') || n.includes('directo') || n.includes('stream') || n.includes('trabajar')) 
    return <Video className={`${iconClass} text-red-500`} />;
  if (n.includes('escribir') || n.includes('post') || n.includes('blog') || n.includes('redactar')) 
    return <PenTool className={`${iconClass} text-emerald-600`} />;
  if (n.includes('cena') || n.includes('comer') || n.includes('cocinar') || n.includes('desayuno') || n.includes('almuerzo')) 
    return <Utensils className={`${iconClass} text-orange-500`} />;
  if (n.includes('compras') || n.includes('super') || n.includes('mercado') || n.includes('ir de')) 
    return <ShoppingBag className={`${iconClass} text-pink-500`} />;
  if (n.includes('carro') || n.includes('lavar') || n.includes('coche') || n.includes('vehiculo')) 
    return <Car className={`${iconClass} text-slate-500`} />;
  if (n.includes('ejercicio') || n.includes('gym') || n.includes('entrenar') || n.includes('deporte')) 
    return <Dumbbell className={`${iconClass} text-rose-500`} />;
  if (n.includes('meditar') || n.includes('paz') || n.includes('yoga')) 
    return <Flame className={`${iconClass} text-yellow-500`} />;
  if (n.includes('cafe') || n.includes('tea') || n.includes('infusion')) 
    return <Coffee className={`${iconClass} text-amber-900`} />;
  if (n.includes('codigo') || n.includes('programar') || n.includes('dev') || n.includes('software')) 
    return <Code className={`${iconClass} text-cyan-600`} />;
  
  return <Target className={`${iconClass} text-text3 opacity-60`} />;
};
