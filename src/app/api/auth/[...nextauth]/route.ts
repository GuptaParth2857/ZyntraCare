import NextAuth from 'next-auth';
import { authOptions } from './options';

const { handlers } = NextAuth(authOptions as any);
export const { GET, POST } = handlers;