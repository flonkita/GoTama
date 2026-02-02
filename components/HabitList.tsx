import { supabase } from "@/utils/supabase";
import { useEffect, useState } from "react";
import { Button, FlatList, StyleSheet, Text, View } from "react-native";

interface Habit {
    id: string;
    title:string;
    description: string;
    count: number;
    target: number;
}

export default function HabitList({userId}: {userId: string}) {
    const [habits, setHabits] = useState<Habit[]>([]);

    useEffect(() => {
        fetchHabits();
    }, []);

    async function fetchHabits() {
        console.log("🔍 Je cherche les quêtes pour l'ID :", userId); // 1. Vérifions l'ID

        const { data, error } = await supabase
        .from('habit')
        .select('*')
        .eq('user_id', userId);

        console.log("📦 Résultat Supabase (data) :", data); // 2. Voyons ce qui revient
        console.log("🛑 Erreur éventuelle :", error); // 3. Y a-t-il un problème caché ?

        if (error) {
            console.error("Erreur lors de la récupération des quêtes:", error);
        } else if (data) {
            setHabits(data);
        }
    }

    // Fonction pour incrémenter le compteur d'une habitude
    async function incrementCountHabit(habitId: string) {
        // 1. ✨ Optimistic UI : On met à jour l'affichage INSTANTANÉMENT
        // L'utilisateur a l'impression que c'est ultra rapide
        setHabits(prevHabits =>
            prevHabits.map(h =>
                h.id === habitId ? { ...h, count: (h.count || 0) + 1 } : h
            )
        );

        // 2. 📡 Envoi de la commande "Blindée" au serveur
        const { error } = await supabase
            .rpc('increment_habit_count', { habit_id: habitId });

        // 3. 🚨 Gestion d'erreur (Rollback)
        if (error) {
            console.error("Erreur de synchronisation :", error.message);

            // Si ça plante côté serveur, on revient en arrière pour ne pas mentir à l'utilisateur
            setHabits(prevHabits =>
                prevHabits.map(h =>
                    h.id === habitId ? { ...h, count: (h.count || 0) - 1 } : h
                )
            );
            // Ici, tu pourrais ajouter un petit Toast d'erreur
            // toast.error("Erreur de connexion, réessayez !");
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>📜 Quêtes en cours</Text>

            {habits.length === 0 ? (
                <Text style={styles.emptyText}>Aucune quête... Le calme avant la tempête ? 🌪️</Text>
            ) : (
                <FlatList
                    data={habits}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View>
                                <Text style={styles.habitTitle}>{item.title}</Text>
                                <Text style={styles.progress}>
                                    Progression : {item.count} / {item.target}
                                </Text>
                            </View>
                            {/* On ajoutera les boutons + ici plus tard */}
                            <Button title="+1" onPress={() => incrementCountHabit(item.id)} />
                        </View>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        width: '100%',
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    emptyText: {
        fontStyle: 'italic',
        color: '#666',
    },
    card: {
        backgroundColor: '#f9f9f9',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#eee',
    },
    habitTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    progress: {
        color: '#666',
        fontSize: 12,
    },
});