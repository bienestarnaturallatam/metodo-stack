'use client';
import React from 'react';

export default function SignatureFooter() {
  const whatsappUrl = "https://wa.me/51914587375?text=Hola,%20vi%20tu%20plataforma%20STACK%20y%20quiero%20informaci%C3%B3n%20sobre%20tus%20servicios%20de%20desarrollo%20de%20SaaS.";
  
  return (
    <div className="pt-16 pb-8 px-6 max-w-4xl mx-auto">
      <a 
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-[#FDFBF7] border border-[#E5E5E5]/40 rounded-2xl p-6 md:p-8 text-center transition-all duration-500 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 group"
        style={{ fontFamily: "'Sora', sans-serif" }}
      >
        <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.25em] text-[#111111]/50 leading-[2] group-hover:text-[#111111]/80 transition-colors duration-300">
          ¿Te gustaría tener tu propio SaaS de Ingeniería de Vida o Bienestar? <br className="hidden md:block" />
          Diseñamos y desarrollamos plataformas de alta fidelidad como esta para tu marca.
        </p>
      </a>
    </div>
  );
}
