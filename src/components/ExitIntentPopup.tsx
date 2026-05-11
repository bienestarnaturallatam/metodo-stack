'use client'

import { useEffect, useState } from 'react'

const WSP_LINK = "https://wa.me/51989078285?text=Hola!%20Vengo%20de%20la%20p%C3%A1gina%20y%20quiero%20mi%20llave%20de%20acceso%20gratis%20por%203%20d%C3%ADas%20al%20M%C3%A9todo%20STACK.%20%F0%9F%8C%BF"

const WhatsAppIcon = ({ style, className }: { style?: React.CSSProperties, className?: string }) => (
  <svg style={style} className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
  </svg>
)

export default function ExitIntentPopup() {
  const [visible, setVisible] = useState(false)
  const [tiempoEnPagina, setTiempoEnPagina] = useState(false)

  const mostrarPopup = () => {
    const yaMostrado = sessionStorage.getItem('popupMostrado')
    if (yaMostrado || !tiempoEnPagina) return
    setTimeout(() => setVisible(true), 500)
    sessionStorage.setItem('popupMostrado', 'true')
  }

  const cerrarPopup = () => setVisible(false)

  useEffect(() => {
    // Mínimo 10 segundos en página
    const timer = setTimeout(() => {
      setTiempoEnPagina(true)
    }, 10000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!tiempoEnPagina) return

    // Desktop — mouse saliendo por arriba
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) mostrarPopup()
    }

    // Mobile — botón atrás
    window.history.pushState(null, '', window.location.href)
    const handlePopState = () => mostrarPopup()

    document.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('popstate', handlePopState)

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [tiempoEnPagina])

  return (
    <>
      {/* Modal Popup (Condicional) */}
      {visible && (
        <>
          {/* Overlay */}
          <div
            onClick={cerrarPopup}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
              zIndex: 9998,
              animation: 'fadeIn 0.3s ease'
            }}
          />

          {/* Card */}
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'white',
            borderRadius: '20px',
            padding: '32px',
            maxWidth: '480px',
            width: '90%',
            zIndex: 9999,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            animation: 'popupIn 0.3s ease'
          }}>

            {/* Botón cerrar */}
            <button
              onClick={cerrarPopup}
              style={{
                position: 'absolute',
                top: '16px',
                right: '20px',
                background: 'none',
                border: 'none',
                fontSize: '20px',
                color: '#999',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>

            {/* Emoji */}
            <div style={{ textAlign: 'center', fontSize: '48px', marginBottom: '8px' }}>
              🎯
            </div>

            {/* Badge */}
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <span style={{
                background: '#FFF3CD',
                color: '#854F0B',
                fontSize: '11px',
                fontWeight: '600',
                padding: '4px 14px',
                borderRadius: '20px'
              }}>
                OFERTA DE ÚLTIMA OPORTUNIDAD
              </span>
            </div>

            {/* Título */}
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              textAlign: 'center',
              margin: '0 0 8px',
              color: '#000'
            }}>
              Espera — no te vayas aún.
            </h2>

            {/* Subtítulo */}
            <p style={{
              fontSize: '15px',
              color: '#444',
              textAlign: 'center',
              margin: '0 0 6px'
            }}>
              Prueba STACK completo gratis por 3 días.
            </p>

            {/* Texto secundario */}
            <p style={{
              fontSize: '13px',
              color: '#888',
              textAlign: 'center',
              margin: '0 0 24px'
            }}>
              Sin tarjeta de crédito. Sin compromiso.<br />
              Si no te convence, no pagas nada.
            </p>

            {/* Lista */}
            {[
              'Los 4 módulos completos (Hábitos, Enfoque, Finanzas, Recursos)',
              'Acceso total por 3 días sin restricciones',
              'Sin tarjeta — empieza en 2 minutos'
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
                fontSize: '13px',
                color: '#333',
                margin: '6px 0'
              }}>
                <span style={{ color: '#00C853', flexShrink: 0 }}>✓</span>
                {item}
              </div>
            ))}

            {/* CTA WSP */}
            <a
              href={WSP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#00C853] text-white font-bold text-[15px] text-center p-4 rounded-xl no-underline mt-5 shadow-[0_4px_14px_rgba(0,200,83,0.3)] transition-transform duration-200 hover:scale-105"
            >
              <WhatsAppIcon className="w-5 h-5" />
              ACTIVAR ACCESO POR WHATSAPP 🔑
            </a>

            {/* CTA Original (secundario) */}
            <a
              href={WSP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                background: '#F0F0F0',
                color: '#333',
                fontWeight: '700',
                fontSize: '14px',
                textAlign: 'center',
                padding: '14px',
                borderRadius: '12px',
                textDecoration: 'none',
                marginTop: '12px'
              }}
            >
              O empezar mi prueba estándar →
            </a>

            {/* Urgencia */}
            <p style={{
              fontSize: '11px',
              color: '#aaa',
              textAlign: 'center',
              marginTop: '12px'
            }}>
              Solo por hoy — oferta válida mientras estés en esta página
            </p>

            {/* Enlace rechazo */}
            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <span
                onClick={cerrarPopup}
                style={{
                  fontSize: '12px',
                  color: '#bbb',
                  textDecoration: 'underline',
                  cursor: 'pointer'
                }}
              >
                No, prefiero perder el acceso
              </span>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0 }
          to { opacity: 1 }
        }
        @keyframes popupIn {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.95) }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1) }
        }
      `}</style>
    </>
  )
}
