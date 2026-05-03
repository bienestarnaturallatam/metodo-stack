'use client'

import { useEffect, useState } from 'react'

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

  if (!visible) return null

  return (
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

        {/* CTA */}
        <a
          href="/register"
          style={{
            display: 'block',
            background: '#00C853',
            color: '#000',
            fontWeight: '700',
            fontSize: '15px',
            textAlign: 'center',
            padding: '16px',
            borderRadius: '12px',
            textDecoration: 'none',
            marginTop: '20px'
          }}
        >
          EMPEZAR MI PRUEBA GRATIS →
        </a>

        {/* Urgencia */}
        <p style={{
          fontSize: '11px',
          color: '#aaa',
          textAlign: 'center',
          marginTop: '8px'
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
