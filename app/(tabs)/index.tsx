import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabase';
import Auth from '@/components/Auth';
// import HabitList from '@/components/HabitList'; // On va le créer juste après !

export default function HomeScreen() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Vérifier s'il y a déjà une session au démarrage
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Écouter les changements (connexion / déconnexion)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={styles.loading} />;
  }

  return (
    <View style={styles.container}>
      {session && session.user ? (
        // Si connecté : On affiche le jeu (pour l'instant un texte, bientôt la liste)
        <View>
             <Text style={styles.welcome}>Salut, Joueur ! 🎮</Text>
             {/* <HabitList userId={session.user.id} />  <-- Ce sera notre prochaine étape */}
        </View>
      ) : (
        // Sinon : On affiche le Login
        <Auth />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // Blanc pour l'instant
    justifyContent: 'center',
    alignItems: 'center',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  }
});