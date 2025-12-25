import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const mediaList = await prisma.media.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(mediaList);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, type, caption } = body; 

    const newMedia = await prisma.media.create({
      data: {
        url,
        type: type || "IMAGE",
        caption: caption || null, 
      },
    });

    return NextResponse.json(newMedia);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 });
  }
}

// --- NOVO: ROTA PARA DELETAR ---
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id, caption } = body;

    // Se vier ID, deleta só a foto
    if (id) {
        await prisma.media.delete({ where: { id } });
        return NextResponse.json({ success: true });
    }

    // Se vier Caption (Nome do Album), deleta TODAS as fotos desse álbum
    if (caption) {
        await prisma.media.deleteMany({ where: { caption } });
        return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao deletar" }, { status: 500 });
  }
}