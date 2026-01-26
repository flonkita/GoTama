import { AppState } from "react-native";
import 'react-native-url-polyfill/auto';
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Infos for Supabase initialization
const supabaseUrl = "https://hqiqmsbbladeztzkvfia.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxaXFtc2JibGFkZXp0emt2ZmlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NDE3MzAsImV4cCI6MjA4NTAxNzczMH0.JXXHTBI89LPEnJUeNREZQfkub00pzuR4sDxpee_havM";

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