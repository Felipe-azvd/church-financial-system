import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      igreja_id: string
      permissions: string[]
      is_master: boolean
      is_superadmin: boolean
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    role: string
    igreja_id: string
    permissions: string[]
    is_master: boolean
    is_superadmin: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    igreja_id: string
    permissions: string[]
    is_master: boolean
    is_superadmin: boolean
  }
}
