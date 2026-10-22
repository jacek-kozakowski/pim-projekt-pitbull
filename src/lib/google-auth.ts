import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { supabase } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

async function createSessionFromUrl(url: string) {
    const { params, errorCode} = QueryParams.getQueryParams(url);
    if (errorCode) throw new Error(`Error code ${errorCode}`);
    
    const {access_token, refresh_token} = params;

    if (!access_token) return;
    
    const { error} = await supabase.auth.setSession({access_token, refresh_token});
    if (error) throw error;
}


export async function signInWithGoogle() {
    const redirectTo = Linking.createURL('/');
    console.log('Redirect URL:', redirectTo);
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo, skipBrowserRedirect: true },
    });

    if (error) throw error;
    
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type === 'success') {
        await createSessionFromUrl(result.url);
    }

}