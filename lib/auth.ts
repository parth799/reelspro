import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "your@email.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Messing email and password")
                }

                try {
                    await connectToDatabase();
                     const user = await User.findOne({ email: credentials.email.toLowerCase().trim() });
                    
                    if (!user) {
                        throw new Error("No user found")
                    }

                    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
                    
                    if (!isPasswordValid) {
                        throw new Error("Invalida Password");
                    }

                    return {
                        id: user._id?.toString(),
                        email: user.email,
                        name: user.username || user.email,
                        image: user.profilePicture || null,
                    };
                } catch (error) {
                    console.error("Authentication error:", error);
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user    ) {
                session.user.id = token.id as string;
            }
            return session; 
        },
    },
    pages: {
        signIn: "/auth/login",
        error:"/auth/login"
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60
    },
    secret:process.env.NEXTAUTH_SECRET
}