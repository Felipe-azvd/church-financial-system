import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      perfil: string
      igreja_id: string
      permissions: string[]
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    perfil: string
    igreja_id: string
    permissions: string[]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    perfil: string
    igreja_id: string
    permissions: string[]
  }
}
