import sys

file_path = r'c:\Users\Lenovo\Desktop\PROYECTO STACK\metodo-stack - base -V2 DIA 22 DE ABRIL 2026 copia\src\app\planner\PlannerClient.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Line numbers in view_file are 1-indexed.
# Lines 905 to 909 are broken.
# Correct end of tasks map:
# 904:                         );
# 905:                       });
# 906:                   })()}
# 907:                 </div>

# I will replace the block from 905 to 910 (0-indexed 904 to 909)
# with the correct closing tags.

new_block = [
    '                      });\n',
    '                    })()}\n',
    '                </div>\n',
]

# We need to be careful with the exact structure.
# Let's verify what's around.
# 904 was the end of the return ( ... );
# 905 should be the end of map });
# 906 should be the end of IIFE })()}
# 907 should be the end of space-y-3 </div>

lines[904:910] = new_block # This replaces lines 905 to 910 inclusive

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("File fixed successfully")
