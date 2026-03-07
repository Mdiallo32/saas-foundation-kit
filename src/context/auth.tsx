import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { Profile } from "@/types";

interface AuthContextType {
    session: Session | null;
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    /** Re-fetch the current user's profile (e.g. after uploading a new avatar). */
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    const loadProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("id, firm_id, email, name, role, hourly_rate, avatar_r2_key")
                .eq("id", userId)
                .single();
            if (error) {
                console.error("loadProfile error:", error);
                setProfile(null);
                setLoading(false);
                return;
            }
            setProfile(data as Profile);
            setLoading(false);
        } catch (err) {
            console.error("loadProfile exception:", err);
            setProfile(null);
            setLoading(false);
        }
    };

    const refreshProfile = async () => {
        const { data: { session: current } } = await supabase.auth.getSession();
        if (current?.user) await loadProfile(current.user.id);
    };

    useEffect(() => {
        // Rely solely on onAuthStateChange — it fires INITIAL_SESSION on mount,
        // covering the cold-start case without the duplicate loadProfile call
        // that a parallel getSession() would cause.
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
            setSession(session);
            if (session?.user) {
                await loadProfile(session.user.id);
            } else {
                setProfile(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    };

    return (
        <AuthContext.Provider value={{
            session,
            user: session?.user ?? null,
            profile,
            loading,
            signIn,
            signOut,
            refreshProfile,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};
