import NextAuth from "next-auth"
import authConfig from "./auth.config"
import connectDB from "@/lib/mongodb"
import Profile from "@/app/models/Profile"

import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        ...authConfig.providers,
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                const log = (msg: string) => {
                    console.log(msg);
                };

                log(`Authorize called with email: ${credentials?.email}`);
                if (!credentials?.email || !credentials?.password) {
                    log("Missing email or password");
                    return null;
                }
                
                try {
                    log("Connecting to DB...");
                    await connectDB();
                    log(`Finding user with email: [${credentials.email}]`);
                    const user = await Profile.findOne({ email: credentials.email as string }).select("+password").lean();
                    log(`User found: ${!!user}`);
                    
                    if (!user) {
                        log(`No user found with email: ${credentials.email}`);
                        return null;
                    }
                    
                    log(`Available fields: ${Object.keys(user).join(", ")}`);
                    
                    if (!user.password) {
                        log("User has no password field in the database results");
                        return null;
                    }

                    log("Comparing passwords...");
                    const isValid = await bcrypt.compare(credentials.password as string, user.password);
                    log(`Comparison result: ${isValid}`);

                    if (isValid) {
                        log("Login SUCCESS");
                        return {
                            id: user._id.toString(),
                            name: `${user.firstName} ${user.lastName}`,
                            email: user.email,
                            image: user.avatarUrl,
                            role: user.role
                        };
                    }
                    log("Login FAILURE: Password mismatch");
                    return null;
                } catch (error: any) {
                    log(`FATAL AUTH ERROR: ${error.message}\n${error.stack}`);
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            // Allow credentials login to pass through
            if (account?.provider === "credentials") return true;

            if (account?.provider === "google") {
                try {
                    await connectDB()
                    if (!user.email) return false;
                    const email = user.email as string;

                    // Check if user exists
                    let existingUser = await Profile.findOne({ email })

                    if (!existingUser) {
                        // Create new user
                        await Profile.create({
                            clerkId: `google_${user.id}`, // Legacy Placeholder
                            googleId: user.id, // Store Google Subject ID
                            email: email,
                            firstName: profile?.given_name || user.name?.split(" ")[0],
                            lastName: profile?.family_name || user.name?.split(" ")[1] || "",
                            avatarUrl: user.image || undefined,
                            role: "user",
                            onboardingCompleted: false,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        })
                    } else {
                        // Ensure googleId is set for existing users logging in with Google
                        if (!existingUser.googleId) {
                            existingUser.googleId = user.id;
                            await existingUser.save();
                        }
                    }
                    return true
                } catch (error) {
                    console.error("Error checking/creating user:", error)
                    return false
                }
            }
            return true
        },
        async session({ session, token }) {
            const log = (msg: string) => {
                console.log(`[SESSION] ${msg}`);
            };

            try {
                log(`Session callback for email: ${session.user?.email}`);
                await connectDB();
                const dbUser = await Profile.findOne({ email: session.user.email });
                if (dbUser) {
                    log(`DB User found: ${dbUser._id}, clerkId: ${dbUser.clerkId}`);
                    // @ts-ignore
                    session.user.id = dbUser._id.toString();
                    // @ts-ignore
                    session.user.role = dbUser.role;
                    // @ts-ignore
                    session.user.college = dbUser.college;
                    // @ts-ignore
                    session.user.onboardingCompleted = dbUser.onboardingCompleted;
                    log(`Session updated with id: ${session.user.id}`);
                } else {
                    log(`DB User NOT found for email: ${session.user?.email}`);
                }
            } catch (error: any) {
                log(`Session error: ${error.message}`);
                console.error("Error fetching user for session:", error);
            }
            return session;
        },
        async jwt({ token, user, account }) {
            const log = (msg: string) => {
                console.log(`[JWT] ${msg}`);
            };

            if (user) {
                log(`JWT user set for ID: ${user.id}`);
                token.id = user.id;
            }
            return token;
        }
    },
    pages: {
        signIn: '/login',
    }
})
