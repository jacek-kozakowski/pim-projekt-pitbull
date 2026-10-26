import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { supabase } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

function getQueryParams(input: string) {
    const url = new URL(input, 'https://phony.example');
    const errorCode = url.searchParams.get('errorCode');
    url.searchParams.delete('errorCode');

    const params: Record<string, string> = {};
    url.searchParams.forEach((value, key) => { params[key] = value; });
    new URLSearchParams(url.hash.replace(/^#/, '')).forEach((value, key) => { params[key] = value; });

    return { params, errorCode };
}

async function createSessionFromUrl(url: string) {
    const { params, errorCode} = getQueryParams(url);
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