import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Buscar todas as cartas
export async function GET() {
  try {
    const letters = await prisma.letter.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(letters);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar cartas" }, { status: 500 });
  }
}

// POST: Escrever nova carta
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content, sender } = body;

    const newLetter = await prisma.letter.create({
      data: {
        title,
        content,
        sender, // Pode ser "Eu", "Rafa" ou deixar anônimo
        isRead: false
      },
    });

    return NextResponse.json(newLetter);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao enviar carta" }, { status: 500 });
  }
}