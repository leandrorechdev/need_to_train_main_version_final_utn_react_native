import React, { useState, useEffect, useCallback } from "react";
import { View, TextInput, TouchableOpacity, Text, KeyboardAvoidingView, Platform } from "react-native";
import FormHeader from "@/components/FormHeader";
import { auth, db } from "@/config/firebase";
import { i18n } from "@/constants/i18n";
import { getFormStyles } from "@/constants/styles";
import { useLanguage } from "@/context/LanguageContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    addDoc,
    collection,
    doc,
    getDoc,
    serverTimestamp,
    updateDoc,
} from "firebase/firestore";
import FormWrapper from "../FormWrapper";
import CustomModal from "@/components/modals/CustomModal";

export default function GymForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [tipoModalidad, setTipoModalidad] = useState("barbell");
    // Claves unificadas en inglés para coincidir con i18n
    const [metrics, setMetrics] = useState<Record<string, string>>({
        name: "",
        sets: "",
        reps: "",
        weight: "",
        rest: "",
    });

    const [modalConfig, setModalConfig] = useState({
        visible: false,
        title: "",
        message: "",
        type: "info" as "success" | "error" | "info",
    });

    const colors = useAppTheme();
    const router = useRouter();
    const { locale } = useLanguage();
    const styles = getFormStyles(colors);
    const { workoutId, dayKey } = useLocalSearchParams<{
        workoutId?: string;
        dayKey: string;
    }>();

    const fields = ["name", "sets", "reps", "weight", "rest"];
    const modalities = ["dumbbells", "barbell", "machine", "bodyweight"];

    useEffect(() => {
        if (workoutId) {
            const loadWorkout = async () => {
                const docSnap = await getDoc(doc(db, "workouts", workoutId));
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setMetrics(data.metrics || {});
                    setTipoModalidad(data.modalidad || "barbell");
                }
            };
            loadWorkout();
        }
    }, [workoutId]);

    const handleSave = async () => {
        if (!metrics.name.trim()) return;
        setIsLoading(true);
        try {
            const data = {
                userId: auth.currentUser?.uid,
                type: "gym",
                day: (dayKey || "monday").toLowerCase(),
                modalidad: tipoModalidad,
                metrics,
                updatedAt: serverTimestamp(),
            };

            workoutId
                ? await updateDoc(doc(db, "workouts", workoutId), data)
                : await addDoc(collection(db, "workouts"), {
                      ...data,
                      createdAt: serverTimestamp(),
                  });

            setModalConfig({
                visible: true,
                title: i18n.t("workout.successTitle"),
                message: i18n.t("workout.successSave"),
                type: "success",
            });
            setTimeout(() => router.back(), 1500);
        } catch (e) {
            setModalConfig({
                visible: true,
                title: "Error",
                message: "No se pudo guardar",
                type: "error",
            });
            setIsLoading(false);
        }
    };

    // Usamos useCallback para que la función de cierre no se recree en cada render
    const closeModal = useCallback(
        () => setModalConfig((prev) => ({ ...prev, visible: false })),
        [],
    );

    return (
        <FormWrapper withScroll>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0} 
            ></KeyboardAvoidingView>
            <FormHeader
                titleEs="NUEVO EJERCICIO GYM 🏋️‍♂️"
                titleEn="ADD GYM WORKOUT 🏋️‍♂️"
                dayKey={dayKey}
                locale={locale}
            />
            <View style={styles.formContainer}>
                <View style={styles.sectionCard}>
                    <Text style={styles.sectionLabel}>
                        {locale === "es" ? "MODALIDAD" : "WORKOUT MODE"}
                    </Text>
                    <View
                        style={{
                            flexDirection: "row",
                            flexWrap: "wrap",
                            gap: 8,
                        }}
                    >
                        {modalities.map((m) => (
                            <TouchableOpacity
                                key={m}
                                style={[
                                    {
                                        flex: 1,
                                        minWidth: "45%",
                                        padding: 12,
                                        borderRadius: 12,
                                        borderWidth: 1,
                                        alignItems: "center",
                                        borderColor: colors.border,
                                    },
                                    tipoModalidad === m && {
                                        backgroundColor: colors.accent,
                                    },
                                ]}
                                onPress={() => setTipoModalidad(m)}
                            >
                                <Text
                                    style={{
                                        color:
                                            tipoModalidad === m
                                                ? colors.buttonText
                                                : colors.text,
                                        fontWeight: "bold",
                                    }}
                                >
                                    {i18n.t(`gym.modalities.${m}`)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.sectionCard}>
                    {fields.map((field) => (
                        <View key={field} style={{ marginBottom: 10 }}>
                            <Text style={styles.inputLabel}>
                                {i18n.t(`gym.${field}`)}
                            </Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: colors.inputBg,
                                        color: colors.text,
                                    },
                                ]}
                                placeholder={i18n.t(`gym.${field}`)}
                                placeholderTextColor={colors.textMuted}
                                keyboardType={
                                    field === "name" ? "default" : "numeric"
                                }
                                value={metrics[field] || ""}
                                onChangeText={(v) =>
                                    setMetrics((prev) => ({
                                        ...prev,
                                        [field]: v,
                                    }))
                                }
                            />
                        </View>
                    ))}
                </View>

                <TouchableOpacity
                    style={styles.btnSave}
                    onPress={handleSave}
                    disabled={isLoading}
                >
                    <Text style={styles.btnSaveText}>
                        {isLoading ? "..." : "GUARDAR"}
                    </Text>
                </TouchableOpacity>
            </View>

            <CustomModal
                visible={modalConfig.visible}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                colors={colors}
                onClose={closeModal}
                autoClose={modalConfig.type === "success"}
            />
        </FormWrapper>
    );
}
