import { AppState } from "react-native";
import 'react-native-url-polyfill/auto';
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Infos for Supabase initialization
const supabaseUrl = process.env.URL_SUPABASE as string;
const supabaseAnonKey = process.env.ANON_KEY as string;

// Create a single Supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    detectSessionInUrl: false,
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Optional: Handle app state changes to manage Supabase auth sessions
AppState.addEventListener('change', (nextAppState) => {
  if (nextAppState === 'active') {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        supabase.auth.setSession(session);
      }
    });
  }
});