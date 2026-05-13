import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  trustHost: true,
  logger: {
    error(code, metadata) {
      console.error('[Auth] Error:', code, metadata);
    },
    warn(code) {
      console.warn('[Auth] Warn:', code);
    },
    debug(code, metadata) {
      console.debug('[Auth] Debug:', code, metadata);
    },
  },
  providers: [
    // GitHub Provider (no API key needed for basic auth)
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET ? [
      GitHubProvider({
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
      })
    ] : []),
    // Only add GoogleProvider if credentials exist
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

    // For demo: accept any valid email/password combo
    CredentialsProvider({
      id: 'credentials',
      name: 'Email & Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(credentials.email)) {
          return null;
        }

        // Validate password (min 6 chars)
        if (credentials.password.length < 6) {
          return null;
        }

        try {
          // Find user in database
          const user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase() },
            include: { subscription: true }
          });

          // If user exists and has password, verify it
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

    // DISABLED: Phone OTP provider - causing errors
    // CredentialsProvider({
    //   id: 'phone-otp',
    //   name: 'Phone OTP',
    //   credentials: {
    //     phone: { label: 'Phone', type: 'text' },
    //     otp: { label: 'OTP', type: 'text' },
    //   },
    //   async authorize(credentials) {
    //     console.log('[Auth] Phone OTP authorize called with:', typeof credentials, credentials);
    //     if (!credentials) return null;
    //     
    //     // For demo: accept any valid 10-digit phone + 6-digit OTP
    //     if (credentials?.phone?.length === 10 && credentials?.otp?.length === 6) {
    //       try {
    //         // Check or create user by phone
    //         let user = await prisma.user.findUnique({
    //           where: { phone: credentials.phone },
    //           include: { subscription: true }
    //         });

    //         if (!user) {
    //           user = await prisma.user.create({
    //             data: {
    //               phone: credentials.phone,
    //               name: `User ${credentials.phone.slice(-4)}`,
    //               email: `${credentials.phone}@zyntracare.com`,
    //               role: 'patient',
    //             },
    //             include: { subscription: true }
    //           });
    //         }

    //         return {
    //           id: user.id,
    //           name: user.name,
    //           email: user.email,
    //           role: user.role,
    //         };
    //       } catch (error) {
    //         console.error('[Auth] Phone OTP error:', error);
    //         return {
    //           id: `phone_${credentials.phone}`,
    //           name: `User ${credentials.phone.slice(-4)}`,
    //           email: `${credentials.phone}@sms.zyntracare.com`,
    //           role: 'patient',
    //         };
    //       }
    //     }
    //     return null;
    //   },
    // }),
  ],

  pages: {
    signIn: '/',
    error: '/?error=1',
  },

  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },

  secret: process.env.NEXTAUTH_SECRET || 'dev-secret-min-32-chars-long-for-safety!!',

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role || 'patient';
        
        // Only fetch subscription on SIGN IN (first time), not on every request
        if (!token.subscription) {
          try {
            const subscription = await prisma.subscription.findUnique({
              where: { userId: user.id }
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
      
      // Handle session update - verify trigger is a valid string
      if (typeof trigger === 'string' && trigger === 'update' && session) {
        token.subscription = session.subscription;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.subscription = token.subscription as { plan: string; status: string };
      }
      return session;
    },
  },
};