'use client';
import React from 'react';

export default function SignatureFooter() {
  const whatsappUrl = "https://wa.me/51989078285?text=Hola%20vi%20tu%20SaaS%20y%20me%20interesa%20tu%20servicio%20de%20desarrollo.";
  
  return (
    <div className="pt-20 pb-10 text-center px-6">
      <style jsx>{`
        @keyframes subtlePulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        .animate-pulse-slow {
          animation: subtlePulse 3s infinite ease-in-out;
        }
      `}</style>
      <p className="text-[10px] font-sans font-black uppercase tracking-[0.2em] text-[#7a9b82] leading-loose animate-pulse-slow">
        « Arquitectura de software por BDS · Método STACK. 
        <span className="block sm:inline sm:ml-2">
          Disponibilidad para proyectos exclusivos: 
          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-[#2d5a3d] hover:text-[#00C853] transition-colors border-b border-[#2d5a3d]/20 hover:border-[#00C853]"
          >
            +51 989 078 285
          </a>
        </span> »
      </p>
    </div>
  );
}
