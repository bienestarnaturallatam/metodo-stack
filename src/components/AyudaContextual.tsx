'use client'
import { useState } from 'react'

interface Props {
    titulo: string
    texto: string
    lista?: string[]
}

export default function AyudaContextual({ titulo, texto, lista }: Props) {
    const [abierto, setAbierto] = useState(false)

    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            {/* Ícono ❓ */}
            <button
                onClick={() => setAbierto(!abierto)}
                style={{
                    background: 'none',
                    border: '1px solid #ddd',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    color: '#999',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: '8px',
                    transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = '#00C853'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = '#ddd'}
            >
                ?
            </button>

            {/* Tooltip */}
            {abierto && (
                <>
                    {/* Overlay invisible para cerrar al hacer click fuera */}
                    <div
                        onClick={() => setAbierto(false)}
                        style={{ position: 'fixed', inset: 0, zIndex: 999 }}
                    />

                    <div style={{
                        position: 'absolute',
                        top: '30px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'white',
                        border: '1px solid #eee',
                        borderRadius: '14px',
                        padding: '16px',
                        width: '260px',
                        boxShadow: '0 10px 32px rgba(0,0,0,0.15)',
                        zIndex: 1000,
                        animation: 'appear 0.2s ease-out'
                    }}>
                        {/* Triángulo superior */}
                        <div style={{
                            position: 'absolute',
                            top: '-6px',
                            left: '50%',
                            transform: 'translateX(-50%) rotate(45deg)',
                            width: '12px',
                            height: '12px',
                            background: 'white',
                            borderLeft: '1px solid #eee',
                            borderTop: '1px solid #eee'
                        }} />

                        <p style={{ fontSize: '13px', fontWeight: '700', color: '#1a1a1a', margin: '0 0 6px' }}>{titulo}</p>
                        <p style={{ fontSize: '12px', color: '#666', margin: '0 0 10px', lineHeight: '1.5' }}>{texto}</p>

                        {lista && (
                            <ul style={{ margin: 0, padding: '0 0 0 16px' }}>
                                {lista.map((item, i) => (
                                    <li key={i} style={{ fontSize: '11px', color: '#555', margin: '4px 0' }}>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </>
            )}

            <style jsx>{`
        @keyframes appear {
          from { opacity: 0; transform: translateX(-50%) translateY(10px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
        </div>
    )
}