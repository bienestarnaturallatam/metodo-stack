import { createClient } from '@/lib/server';
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tipo: string }> }
) {
  const { tipo } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  let filePath = '';

  if (tipo === 'mapa') {
    filePath = path.join(process.cwd(), 'src/content/mapa/mapa_mental.html');
  } else if (tipo === 'planos') {
    filePath = path.join(process.cwd(), 'src/content/planos/planos.html');
  } else {
    return new NextResponse('Not Found', { status: 404 });
  }

  try {
    const html = await fs.readFile(filePath, 'utf-8');
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Error reading protected file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
