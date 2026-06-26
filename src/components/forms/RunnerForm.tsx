import FormHeader from "@/components/FormHeader";
import { auth, db } from "@/config/firebase";
import { i18n } from "@/constants/i18n";
import { getFormStyles } from "@/constants/styles";
import { useLanguage } from "@/context/LanguageContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import FormWrapper from "../FormWrapper";

export default function RunnerForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [tipoRunning, setTipoRunning] = useState("Pasadas");

    // Estado único para métricas
    const [metrics, setMetrics] = useState<Record<string, string>>({});

    const colors = useAppTheme();
    const router = useRouter();
    const { locale } = useLanguage();
    const styles = getFormStyles(colors);
    const { dayKey } = useLocalSearchParams<{ dayKey: string }>();

    const modes = {
        Pasadas: ["distance", "time", "rest", "macroRest"],
        Fondo: ["time", "distance"],
        Alargue: ["jog", "strides", "series", "rest", "macroRest"],
    };

    const handleSave = async () => {
        if (!auth.currentUser) return;
        setIsLoading(true);
        try {
            await addDoc(collection(db, "workouts"), {
                userId: auth.currentUser.uid,
                type: "runner",
                day: (dayKey || "monday").toLowerCase(),
                tipoRunning,
                metrics, // Guardamos todas las métricas dinámicas
                updatedAt: serverTimestamp(),
                createdAt: serverTimestamp(),
            });
            router.back();
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <FormWrapper withScroll>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0} 
            ></KeyboardAvoidingView>
            <FormHeader
                titleEs="PLAN RUNNING 🏃‍♂️"
                titleEn="RUNNING SCHEDULE 🏃‍♂️"
                dayKey={dayKey}
                locale={locale}
            />

            <View style={styles.formContainer}>
                {/* Selector de Modalidad */}
                <View style={styles.sectionCard}>
                    <Text style={styles.sectionLabel}>
                        {locale === "es" ? "MODALIDAD" : "WORKOUT MODE"}
                    </Text>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                        {Object.keys(modes).map((m) => (
                            <TouchableOpacity
                                key={m}
                                style={[
                                    {
                                        flex: 1,
                                        paddingVertical: 12,
                                        borderRadius: 12,
                                        borderWidth: 1,
                                        borderColor: colors.border,
                                        alignItems: "center",
                                        backgroundColor:
                                            tipoRunning === m
                                                ? colors.accent
                                                : colors.background,
                                    },
                                ]}
                                onPress={() => {
                                    setTipoRunning(m);
                                    setMetrics({});
                                }}
                            >
                                <Text
                                    style={{
                                        color:
                                            tipoRunning === m
                                                ? colors.buttonText
                                                : colors.text,
                                    }}
                                >
                                    {i18n.t(`workout.${m.toLowerCase()}`)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Inputs Dinámicos */}
                <View style={styles.sectionCard}>
                    {modes[tipoRunning as keyof typeof modes].map((field) => (
                        <View key={field} style={{ marginBottom: 10 }}>
                            <Text style={styles.inputLabel}>
                                {i18n.t(`runner.${field}`)}
                            </Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: colors.inputBg,
                                        color: colors.text,
                                    }, // Forzamos el color
                                ]}
                                placeholderTextColor={colors.textMuted}
                                placeholder={i18n.t(`runner.${field}`)}
                                keyboardType="numeric"
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
        </FormWrapper>
    );
}
