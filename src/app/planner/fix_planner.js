const fs = require('fs');
const path = 'c:\\Users\\Lenovo\\Desktop\\PROYECTO STACK\\metodo-stack - base -V2 DIA 22 DE ABRIL 2026 copia\\src\\app\\planner\\PlannerClient.tsx';

const content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

// Correcting from line 905 to 910 (1-indexed)
// lines[904] to lines[909]
const newBlock = [
    '                      });',
    '                    })()}',
    '                </div>',
    '              </div>',
    '            ) : (',
    '              <div className="space-y-8 animate-in fade-in duration-700">'
];

// In the previous view_file:
// 905: })()}
// 906: </div>
// 907: );
// 908: });
// 909: })()}
// 910: (empty or something)
// 911: {/* GLOBAL MOVE MODAL ... */}

// Wait, I should find the indices precisely.
const startIndex = 904; // 1-indexed 905
const endIndex = 910;   // 1-indexed 911

lines.splice(startIndex, endIndex - startIndex, ...newBlock);

fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log('File fixed successfully with Node.js');
