import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// Endpoint público e leve, sem autenticação. Usado por serviços de ping
// (cron do GitHub Actions, UptimeRobot etc.) para manter o compute do banco
// (Neon) ativo — o plano free hiberna após alguns minutos sem uso.
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ status: "ok" })
  } catch (error) {
    return NextResponse.json({ status: "error" }, { status: 503 })
  }
}
