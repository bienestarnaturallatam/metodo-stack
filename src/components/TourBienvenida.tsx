'use client'
import { useState, useEffect, useLayoutEffect } from 'react'
import { X, ChevronRight, ChevronLeft } from 'lucide-react'

const pasos = [
    {
        id: 'bienvenida',
        tipo: 'modal',
        icono: '🎯',
        titulo: 'Bienvenido a Método STACK',
        texto: 'En 60 segundos te mostramos todo lo que puedes hacer aquí. ¿Empezamos?',
    },
    {
        id: 'sidebar',
        tipo: 'highlight',
        selector: '[data-tour="sidebar"]',
        titulo: 'Tus 4 módulos',
        texto: 'Aquí accedes a Control de Hábitos, Enfoque Semanal, Finanzas Personales y Recursos. Cada uno es un sistema completo.',
        posicion: 'derecha',
    },
    {
        id: 'habitos',
        tipo: 'highlight',
        selector: '[data-tour="mis-habitos"]',
        titulo: 'Control de Hábitos',
        texto: 'Agrega tus hábitos diarios y marca cada día si los cumpliste. El calendario muestra tu racha y % de cumplimiento automáticamente.',
        posicion: 'abajo',
    },
    {
        id: 'agregar-habito',
        tipo: 'highlight',
        selector: '[data-tour="agregar-habito"]',
        titulo: 'Agrega tu primer hábito ahora',
        texto: 'Escribe el nombre de un hábito que quieras construir. Ejemplo: "Ejercicio 30 min", "Leer 20 páginas", "Meditar". Sé específico.',
        posicion: 'abajo',
    },
    {
        id: 'estado-mental',
        tipo: 'highlight',
        selector: '[data-tour="estado-mental"]',
        titulo: 'Estado Mental Diario',
        texto: 'Cada día registra tu Ánimo y Motivación. Con el tiempo verás patrones: qué días rindes más y qué afecta tu estado mental.',
        posicion: 'arriba',
    },
    {
        id: 'final',
        tipo: 'modal',
        icono: '🚀',
        titulo: '¡Listo para empezar!',
        texto: 'Ya conoces lo básico. Recuerda: puedes tocar el ícono ❓ en cualquier sección si tienes dudas.',
    },
]

export default function TourBienvenida() {
    const [visible, setVisible] = useState(false)
    const [pasoActual, setPasoActual] = useState(0)
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 })

    useEffect(() => {
        const completado = localStorage.getItem('tourCompletado')
        if (!completado) {
            const timer = setTimeout(() => setVisible(true), 1000)
            return () => clearTimeout(timer)
        }
    }, [])

    useLayoutEffect(() => {
        if (!visible) return
        const paso = pasos[pasoActual]
        if (paso.tipo === 'highlight' && paso.selector) {
            const el = document.querySelector(paso.selector)
            if (el) {
                const rect = el.getBoundingClientRect()
                setCoords({
                    top: rect.top + window.scrollY,
                    left: rect.left + window.scrollX,
                    width: rect.width,
                    height: rect.height
                })
                el.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
        }
    }, [pasoActual, visible])

    const finalizar = () => {
        localStorage.setItem('tourCompletado', 'true')
        setVisible(false)
    }

    if (!visible) return null

    const paso = pasos[pasoActual]
    const esUltimo = pasoActual === pasos.length - 1

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, overflow: 'hidden' }}>
            {/* Overlay oscuro con Spotlight */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.75)',
                transition: 'all 0.4s ease'
            }}>
                {paso.tipo === 'highlight' && (
                    <div style={{
                        position: 'absolute',
                        top: coords.top - 4,
                        left: coords.left - 4,
                        width: coords.width + 8,
                        height: coords.height + 8,
                        borderRadius: '8px',
                        boxShadow: '0 0 0 9999px rgba(0,0,0,0.75)',
                        pointerEvents: 'none'
                    }} />
                )}
            </div>

            {/* Tooltip o Modal */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, width: '100%', height: '100%',
                display: 'flex',
                alignItems: paso.tipo === 'modal' ? 'center' : 'flex-start',
                justifyContent: paso.tipo === 'modal' ? 'center' : 'flex-start',
                pointerEvents: 'none'
            }}>
                <div style={{
                    pointerEvents: 'auto',
                    background: 'white',
                    borderRadius: '16px',
                    padding: '24px',
                    width: '90%',
                    maxWidth: '320px',
                    boxShadow: '0 12px 48px rgba(0,0,0,0.3)',
                    position: paso.tipo === 'modal' ? 'relative' : 'absolute',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    // Posicionamiento dinámico del tooltip
                    ...(paso.tipo === 'highlight' && {
                        top: paso.posicion === 'abajo' ? coords.top + coords.height + 20 :
                            paso.posicion === 'arriba' ? coords.top - 240 : coords.top,
                        left: paso.posicion === 'derecha' ? coords.left + coords.width + 20 :
                            coords.left + (coords.width / 2) - 160
                    })
                }}>
                    {/* Barra de progreso */}
                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '10px', fontWeight: '800', color: '#999', textTransform: 'uppercase' }}>
                                Paso {pasoActual + 1} de {pasos.length}
                            </span>
                        </div>
                        <div style={{ height: '3px', background: '#eee', borderRadius: '2px' }}>
                            <div style={{
                                height: '100%',
                                background: '#00C853',
                                width: `${((pasoActual + 1) / pasos.length) * 100}%`,
                                transition: 'width 0.3s ease'
                            }} />
                        </div>
                    </div>

                    {paso.icono && <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '12px' }}>{paso.icono}</div>}
                    <h2 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 8px', color: '#1a1a1a' }}>{paso.titulo}</h2>
                    <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6', margin: '0 0 24px' }}>{paso.texto}</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {pasoActual > 0 && paso.tipo !== 'modal' && (
                                <button
                                    onClick={() => setPasoActual(p => p - 1)}
                                    style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #ddd', background: 'white', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    ← Anterior
                                </button>
                            )}
                            <button
                                onClick={() => pasoActual < pasos.length - 1 ? setPasoActual(p => p + 1) : finalizar()}
                                style={{ flex: 2, padding: '12px', borderRadius: '10px', border: 'none', background: '#00C853', color: 'black', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                            >
                                {pasoActual === 0 ? 'Empezar →' : esUltimo ? '¡Empezar ahora! →' : 'Siguiente →'}
                            </button>
                        </div>

                        {esUltimo ? (
                            <button onClick={finalizar} style={{ padding: '10px', background: 'none', border: '1px solid #eee', borderRadius: '10px', fontSize: '12px', color: '#888', cursor: 'pointer' }}>
                                Ver el manual completo
                            </button>
                        ) : (
                            <button onClick={finalizar} style={{ background: 'none', border: 'none', fontSize: '11px', color: '#aaa', cursor: 'pointer', padding: '8px' }}>
                                Saltar tour
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}