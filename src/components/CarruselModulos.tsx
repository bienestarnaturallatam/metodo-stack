'use client'

import { useState, useEffect, useRef } from 'react'

const modulos = [
  {
    badge: "MÓDULO 1 DE 4",
    icono: "📋",
    nombre: "MÓDULO HÁBITOS",
    precio: "USD $7.90 Cada módulo",
    periodo: "/ año · via Hotmart",
    features: [
      "Hábitos ilimitados",
      "Rachas y estadísticas",
      "Gráficos avanzados",
      "Registro de ánimo"
    ],
    cta: "ACTIVAR HÁBITOS",
    link: "#", // reemplazar con link Hotmart real
    color: "#00C853"
  },
  {
    badge: "MÓDULO 2 DE 4",
    icono: "🎯",
    nombre: "MÓDULO ENFOQUE",
    precio: "USD $7.90 Cada módulo",
    periodo: "/ año · via Hotmart",
    features: [
      "Planeador semanal",
      "Gestión de tareas",
      "Modo trabajo profundo",
      "Priorización táctica"
    ],
    cta: "ACTIVAR ENFOQUE",
    link: "#",
    color: "#1565C0"
  },
  {
    badge: "MÓDULO 3 DE 4",
    icono: "💰",
    nombre: "MÓDULO FINANZAS",
    precio: "USD $7.90 Cada módulo",
    periodo: "/ año · via Hotmart",
    features: [
      "Motor financiero personal",
      "Dashboard ingresos/egresos",
      "Semáforo de presupuesto",
      "Liquidación de deudas"
    ],
    cta: "ACTIVAR FINANZAS",
    link: "#",
    color: "#E65100"
  },
  {
    badge: "MÓDULO 4 DE 4",
    icono: "📖",
    nombre: "MÓDULO RECURSOS",
    precio: "USD $7.90 Cada módulo",
    periodo: "/ año · via Hotmart",
    features: [
      "Guía de hábitos (PDF)",
      "Plano interactivo",
      "Síntesis ejecutiva",
      "Acceso por 1 año"
    ],
    cta: "ACTIVAR RECURSOS",
    link: "#",
    color: "#6A1B9A"
  }
]

export default function CarruselModulos() {
  const [actual, setActual] = useState(0)
  const [pausado, setPausado] = useState(false)
  const [animando, setAnimando] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const cambiarSlide = (siguiente: number) => {
    if (animando) return
    setAnimando(true)
    setTimeout(() => {
      setActual(siguiente)
      setAnimando(false)
    }, 300)
  }

  const siguiente = () => {
    cambiarSlide(actual === modulos.length - 1 ? 0 : actual + 1)
  }

  const anterior = () => {
    cambiarSlide(actual === 0 ? modulos.length - 1 : actual - 1)
  }

  useEffect(() => {
    if (!pausado) {
      intervalRef.current = setInterval(() => {
        setActual(prev => 
          prev === modulos.length - 1 ? 0 : prev + 1
        )
      }, 3000)
    }
    return () => {
      if (intervalRef.current) 
        clearInterval(intervalRef.current)
    }
  }, [pausado])

  const modulo = modulos[actual]

  return (
    <div
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      className="scale-[1.05] z-10"
      style={{
        border: '2px solid #00C853',
        borderRadius: '40px', // Adjusted to match other cards
        padding: '32px', // Adjusted to match other cards (p-8)
        background: 'white',
        position: 'relative',
        minHeight: '420px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        opacity: animando ? 0 : 1,
        transition: 'opacity 0.3s ease',
        boxShadow: '0 25px 50px -12px rgba(0, 200, 83, 0.25)'
      }}
    >
      {/* Badge MÁS POPULAR */}
      <div style={{
        position: 'absolute',
        top: '-14px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#00C853',
        color: '#000',
        fontSize: '11px',
        fontWeight: '900', // Matches font-black
        padding: '4px 16px',
        borderRadius: '20px',
        whiteSpace: 'nowrap',
        letterSpacing: '0.05em'
      }}>
        MÁS POPULAR
      </div>

      {/* Contenido del módulo */}
      <div>
        <div style={{
          fontSize: '10px',
          fontWeight: '900',
          color: modulo.color,
          marginBottom: '4px',
          letterSpacing: '0.05em',
          fontStyle: 'italic'
        }}>
          {modulo.icono} {modulo.badge}
        </div>
        
        <p style={{ 
          fontSize: '11px', 
          fontWeight: '900',
          color: '#666',
          margin: '0 0 4px',
          fontStyle: 'italic'
        }}>
          {modulo.nombre}
        </p>
        
        <p style={{ 
          fontSize: '28px', 
          fontWeight: '900',
          margin: '0 0 2px',
          fontStyle: 'italic'
        }}>
          {modulo.precio.includes('Cada módulo') ? (
            <>
              {modulo.precio.split('Cada módulo')[0]}
              <span style={{ fontSize: '16px', marginLeft: '4px', verticalAlign: 'middle', opacity: 0.8 }}>
                Cada módulo
              </span>
            </>
          ) : modulo.precio}
        </p>
        
        <p style={{ 
          fontSize: '11px', 
          color: '#888',
          margin: '0 0 16px',
          fontWeight: '700'
        }}>
          {modulo.periodo}
        </p>

        <div style={{ flexGrow: 1 }}>
          {modulo.features.map((f, i) => (
            <div key={i} style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'start',
              fontSize: '13px',
              color: '#444',
              margin: '8px 0',
              fontWeight: '700',
              lineHeight: '1.2'
            }}>
              <span style={{ color: '#00C853' }}>✓</span>
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div>
        <a
          href={modulo.link}
          style={{
            display: 'block',
            background: '#00C853',
            color: '#000',
            fontWeight: '900',
            fontSize: '13px',
            textAlign: 'center',
            padding: '16px',
            borderRadius: '16px',
            textDecoration: 'none',
            marginTop: '20px',
            letterSpacing: '0.05em'
          }}
        >
          {modulo.cta}
        </a>

        {/* Navegación — flechas */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '16px'
        }}>
          <button
            onClick={anterior}
            aria-label="Módulo anterior"
            style={{
              background: 'none',
              border: '1px solid #ddd',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              cursor: 'pointer',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ←
          </button>

          {/* Dots indicadores */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {modulos.map((_, i) => (
              <button
                key={i}
                onClick={() => cambiarSlide(i)}
                aria-label={`Ver módulo ${i + 1}`}
                style={{
                  width: i === actual ? '24px' : '12px',
                  height: '12px',
                  borderRadius: '6px',
                  background: i === actual ? '#00C853' : '#ddd',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  padding: 0
                }}
              />
            ))}
          </div>

          <button
            onClick={siguiente}
            aria-label="Módulo siguiente"
            style={{
              background: 'none',
              border: '1px solid #ddd',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              cursor: 'pointer',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            →
          </button>
        </div>
      </div>
    </div>
  )
}
