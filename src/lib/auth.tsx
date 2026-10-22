import { Session } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

type Profile = { nick: string; balance: number; nick_confirmed: boolean };

type AuthState = { session: Session | null; profile: Profile | null;  loading: boolean; refreshProfile: () => Promise<void> };

const AuthContext = createContext<AuthState>({ session: null, profile: null, loading: true, refreshProfile: async () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    const userId = session?.user.id;
    const refreshProfile = useCallback( async () => {
        if (!userId) {
            setProfile(null);
            return;
        }
        const { data } = await supabase.from('profiles').select('nick, balance, nick_confirmed').eq('id', userId).single();
        setProfile(data);
    }, [userId]);
    useEffect(() => {
        supabase.auth.getSession().then(({data}) =>{
            setSession(data.session);
            setLoading(false);
        });
        const {data} = supabase.auth.onAuthStateChange((_event, newSession) =>{
            setSession(newSession);
        })
        return () => data.subscription.unsubscribe();
    }, []);
    
    useEffect(() => {
        refreshProfile();
    }, [refreshProfile]);

    return (
        <AuthContext.Provider value={{ session, profile, loading, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
}
export const useAuth = () => useContext(AuthContext);