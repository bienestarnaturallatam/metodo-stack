import React from 'react';

export default function LegalFooter() {
  return (
    <footer className="mt-20 pb-20 border-t border-gray-100 pt-12 max-w-4xl mx-auto text-center space-y-6 opacity-40 hover:opacity-100 transition-opacity duration-700 px-6">
      <h5 className="text-[10px] font-black uppercase tracking-[0.5em] text-[#2d5a3d] italic">Plataforma de Ingeniería Conductual</h5>
      <p className="text-[9px] font-bold text-gray-400 leading-relaxed uppercase tracking-widest">
        MÉTODO STACK NO ES UNA ENTIDAD FINANCIERA. ESTE SITIO NO FORMA PARTE DE FACEBOOK NI DE FACEBOOK INC. 
        ADEMÁS, ESTE SITIO NO ESTÁ RESPALDADO POR FACEBOOK DE NINGUNA MANERA. 
        FACEBOOK ES UNA MARCA REGISTRADA DE META, INC.
      </p>
    </footer>
  );
}
