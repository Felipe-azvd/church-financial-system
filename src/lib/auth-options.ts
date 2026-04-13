import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.usuario.findUnique({
          where: { email: credentials.email },
          include: { role: true }
        })

        if (!user) {
          return null
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.senha
        )

        if (!isValid) {
          return null
        }

        // Prepara a devolução do usuário
        const cargo = user.role?.nome || "MEMBRO";
        const isMaster = user.is_master === true; 
        
        return {
          id: user.id,
          name: user.nome,
          email: user.email,
          igreja_id: user.igreja_id,
          role: cargo,
          permissions: isMaster ? ["*"] : [],
          is_master: isMaster 
        };
      }
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.igreja_id = (user as any).igreja_id;
        token.is_master = (user as any).is_master;
        token.role = (user as any).role;
        token.permissions = (user as any).permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).igreja_id = token.igreja_id;
        (session.user as any).is_master = token.is_master;
        (session.user as any).role = token.role;
        (session.user as any).permissions = token.permissions;
      }
      return session;
    }
  }
}