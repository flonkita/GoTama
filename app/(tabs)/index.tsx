import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, TextInput, Button } from 'react-native';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabase';
import Auth from '@/components/Auth';
import HabitList from '@/components/HabitList'; // On va le créer juste après !

interface UserProfile {
  avatar_url: string;
  username: string;
  xp: number;
  // Ajoutez d'autres champs de profil si nécessaire
}

export default function HomeScreen() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [newUsername, setNewUsername] = useState('');

  useEffect(() => {
    // 1. Vérifier s'il y a déjà une session au démarrage
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      // Si on a une session, on va chercher le profil du joueur !
      if (session) {
        getProfile(session.user.id);
      }
      setLoading(false);
    });

    // 2. Écouter les changements (connexion / déconnexion)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        getProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fonction pour récupérer le profil utilisateur
  async function getProfile(userId: string) {
    const { data, error } = await supabase
    .from('users') // On cherche dans la table users
    .select('*') // On prends tous les champs
    .eq('id', userId) // Pour l'utilisateur courant
    .single(); // On s'attend à un seul résultat

    if (data) {
      setProfile(data); // On stocke le profil dans le state
    }
  }

  // Fonction pour créer le profil utilisateur
  async function saveProfile() {
    if (!session?.user) return;
    if (newUsername.trim() === "") return; // On empêche les pseudos vides

    const updates = {
      username: newUsername,
      // Petit bonus : On génère un avatar auto basé sur le pseudo
      avatar_url: `https://api.dicebear.com/9.x/pixel-art/svg?seed=${newUsername}`,
      // updated_at: new Date(),
    };

    const { error } = await supabase
      .from('users')
      .update(updates)             // <--- C'est ici que la magie opère (UPDATE et non INSERT)
      .eq('id', session.user.id);  // On cible NOTRE ligne

    if (error) {
      console.error("Erreur mise à jour:", error);
    } else {
      // On recharge le profil pour afficher le résultat tout de suite
      getProfile(session.user.id);
    }
  }

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={styles.loading} />;
  }

  return (
    <View style={styles.container}>
      {session && session.user ? (
        <>
          {/* CAS 1 : Le profil est vide (pas de username) -> CRÉATION DE PERSO */}
          {!profile?.username ? (
            <View style={styles.formContainer}>
              <Text style={styles.title}>Choisis ton nom de Héros 🛡️</Text>
              <TextInput
                style={styles.input}
                onChangeText={setNewUsername}
                value={newUsername}
                placeholder="Ex: Aragorn du 33"
              />
              <Button title="Valider mon personnage" onPress={saveProfile} />
            </View>
          ) : (
            /* CAS 2 : Le profil est complet -> JEU */
            <View style={styles.formContainer}>
              <Text style={styles.welcome}>Salut, {profile.username} ! 🎮</Text>
              <Text>XP actuelle : {profile.xp} points</Text>
              {/* Petite image pour voir l'avatar généré */}
              {/* <Image source={{ uri: profile.avatar_url }} style={{ width: 100, height: 100 }} /> */}
              <HabitList userId={session.user.id} />
            </View>
          )}
        </>
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
  },
  formContainer: {
    width: '80%',
    gap: 20, // Espace les éléments
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
});