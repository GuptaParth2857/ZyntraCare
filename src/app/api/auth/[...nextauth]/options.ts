import type { NextAuthConfig, Session, User } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export const authOptions: NextAuthConfig = {
  trustHost: true,
  logger: {
    error(code: unknown, ...metadata: unknown[]) {
      console.error('[Auth] Error:', code, ...metadata);
    },
    warn(code: unknown, ...metadata: unknown[]) {
      console.warn('[Auth] Warn:', code, ...metadata);
    },
    debug(code: unknown, ...metadata: unknown[]) {
      console.debug('[Auth] Debug:', code, ...metadata);
    },
  },
  providers: [
    // GitHub Provider
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET ? [
      GitHubProvider({
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
      })
    ] : []),

    // Google Provider
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        authorization: {
          params: {
            prompt: "consent",
            access_type: "offline",
            response_type: "code"
          }
        },
        profile(profile) {
          return {
            id: profile.sub,
            name: profile.name,
            email: profile.email,
            image: profile.picture,
            role: 'patient',
          };
        }
      })
    ] : []),

    // Email/Password Provider - PRODUCTION MODE
    CredentialsProvider({
      id: 'credentials',
      name: 'Email & Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) return null;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(credentials.email)) {
          return null;
        }

        if (credentials.password.length < 6) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase() },
            include: { subscription: true }
          });

          if (user && user.passwordHash) {
            const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
            if (!isValid) {
              console.log('[Auth] Invalid password for:', credentials.email);
              return null;
            }
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }

          console.log('[Auth] Login denied - user not found:', credentials.email);
          return null;
        } catch (error) {
          console.error('[Auth] Database error:', error);
          return null;
        }
      },
    }),

    // Phone OTP Provider - PRODUCTION MODE
    CredentialsProvider({
      id: 'phone-otp',
      name: 'Phone OTP',
      credentials: {
        phone: { label: 'Phone', type: 'text' },
        otp: { label: 'OTP', type: 'text' },
      },
      async authorize(credentials: any) {
        if (!credentials) return null;

        if (credentials?.phone?.length === 10 && credentials?.otp?.length === 6) {
          try {
            const normalizedPhone = credentials.phone.replace(/\s/g, '').replace(/^\+91/, '91');

            const stored = await prisma.otpToken.findFirst({
              where: { phone: normalizedPhone, used: false },
              orderBy: { createdAt: 'desc' }
            });

            if (!stored) return null;

            if (Date.now() > stored.expiresAt.getTime()) {
              await prisma.otpToken.update({ where: { id: stored.id }, data: { used: true } });
              return null;
            }

            if (stored.otp !== credentials.otp) return null;

            await prisma.otpToken.update({ where: { id: stored.id }, data: { used: true } });

            let user = await prisma.user.findUnique({
              where: { phone: normalizedPhone },
              include: { subscription: true }
            });

            if (!user) {
              user = await prisma.user.create({
                data: {
                  phone: normalizedPhone,
                  name: `User ${normalizedPhone.slice(-4)}`,
                  email: `${normalizedPhone}@zyntracare.com`,
                  role: 'patient',
                },
                include: { subscription: true }
              });
            }

            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
          } catch (error) {
            console.error('[Auth] Phone OTP error:', error);
            return null;
          }
        }
        return null;
      },
    }),
  ],

  pages: {
    signIn: '/auth/signin',
    error: '/?error=1',
  },

  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },

  callbacks: {
    async jwt({ token, user, trigger, session }: { token: JWT; user?: User; trigger?: string; session?: any }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role || 'patient';
        
        if (!token.subscription) {
          try {
            const subscription = await prisma.subscription.findUnique({
              where: { userId: (user as any).id }
            });
            token.subscription = subscription ? {
              plan: subscription.plan,
              status: subscription.status
            } : { plan: 'Free', status: 'active' };
          } catch {
            token.subscription = { plan: 'Free', status: 'active' };
          }
        }
      }
      
      if (typeof trigger === 'string' && trigger === 'update' && session) {
        token.subscription = session.subscription;
      }
      
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
        (session.user as any).subscription = token.subscription as { plan: string; status: string };
      }
      return session;
    },
  },
};
