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

        // 🔥 AJUSTE 1: Agora ele puxa as permissões conectadas à função (Role) do usuário
        const user = await prisma.usuario.findUnique({
          where: { email: credentials.email },
          include: { 
            role: {
              include: {
                role_permissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
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

        const cargo = user.role?.nome || "MEMBRO";
        const isMaster = user.is_master === true; 
        const isSuperAdmin = user.is_superadmin === true; // 🔥 Identifica se é Você (Dono do SaaS)

        // 🔥 AJUSTE 2: Dá a chave mestra pra você. Para os outros, entrega as permissões exatas que o cargo tem.
        const permissoes = isSuperAdmin 
          ? ["*"] 
          : user.role?.role_permissions.map(rp => rp.permission.key) || [];
        
        return {
          id: user.id,
          name: user.nome,
          email: user.email,
          igreja_id: user.igreja_id,
          role: cargo,
          permissions: permissoes, 
          is_master: isMaster,
          is_superadmin: isSuperAdmin // 🔥 Salva o status de Deus
        };
      }
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.igreja_id = user.igreja_id;
        token.is_master = user.is_master;
        token.is_superadmin = user.is_superadmin; // 🔥 Repassa pro Token
        token.role = user.role;
        token.permissions = user.permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id || token.sub as string;
        session.user.igreja_id = token.igreja_id;
        session.user.is_master = token.is_master;
        session.user.is_superadmin = token.is_superadmin; // 🔥 Repassa pra Sessão
        session.user.role = token.role;
        session.user.permissions = token.permissions;
      }
      return session;
    }
  }
}