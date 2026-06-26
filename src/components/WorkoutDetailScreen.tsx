import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
import { useAppTheme } from "@/hooks/useAppTheme";
import { getFormStyles } from "@/constants/styles";
import FormHeader from "@/components/FormHeader";
// Asumiendo que crearás estos componentes de visualización luego
import GymDisplayCard from "@/components/workouts/GymDisplayCard";
import RunnerDisplayCard from "@/components/workouts/RunnerDisplayCard";

export default function WorkoutDetailScreen() {
    const { workoutId } = useLocalSearchParams<{ workoutId: string }>();
    const [workout, setWorkout] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const colors = useAppTheme();
    const styles = getFormStyles(colors); // Reutilizamos tus estilos base
    const router = useRouter();

    useEffect(() => {
        const fetchWorkout = async () => {
            try {
                const docRef = doc(db, "workouts", workoutId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) setWorkout(docSnap.data());
            } catch (error) {
                console.error("Error al cargar:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchWorkout();
    }, [workoutId]);

    if (loading)
        return (
            <ActivityIndicator
                size="large"
                color={colors.accent}
                style={{ flex: 1 }}
            />
        );
    if (!workout)
        return (
            <Text
                style={{
                    color: colors.text,
                    textAlign: "center",
                    marginTop: 50,
                }}
            >
                No se encontró el ejercicio
            </Text>
        );

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <FormHeader
                titleEs={workout.type === "gym"
                    ? "DETALLE GYM 🏋️‍♂️"
                    : "DETALLE RUNNING 🏃‍♂️"}
                titleEn={workout.type === "gym"
                    ? "GYM DETAIL 🏋️‍♂️"
                    : "RUNNING DETAIL 🏃‍♂️"} locale={""}            />

            <View style={{ padding: 20 }}>
                {workout.type === "gym" ? (
                    <GymDisplayCard
                        data={workout.metrics}
                        modalidad={workout.modalidad}
                    />
                ) : (
                    <RunnerDisplayCard data={workout.metrics} />
                )}
            </View>

            {/* Reutilizamos el estilo de botón que ya tienes en la app */}
            <TouchableOpacity
                style={[
                    styles.btnSave,
                    { backgroundColor: colors.secondaryAccent, marginTop: 20 },
                ]}
                onPress={() => router.back()}
            >
                <Text style={styles.btnSaveText}>VOLVER</Text>
            </TouchableOpacity>
        </View>
    );
}
