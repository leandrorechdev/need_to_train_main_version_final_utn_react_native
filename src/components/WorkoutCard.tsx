import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import YoutubeBrowserModal from "./YoutubeBrowserModal";
import { formatWorkoutDescription } from "@/utils/workoututils";

interface WorkoutItem {
    id: string;
    type: "gym" | "runner" | "youtube";
    day: string;
    text: string;
    subText?: string;
    youtubeUrl?: string;
    series?: string;
    reps?: string;
    distance?: string;
    duration?: string;
}

interface WorkoutCardProps {
    item: WorkoutItem;
    colors: any;
    onDelete: (id: string) => void;
    locale: string;
}

export default function WorkoutCard({
    item,
    colors,
    onDelete,
    locale,
}: WorkoutCardProps) {
    const router = useRouter();
    const [ytModalVisible, setYtModalVisible] = useState(false);
    const description = formatWorkoutDescription(item, locale);

    // Navegación a Detalle
    const handleViewDetail = () => {
        if (item.type === "youtube") return;
        router.push({
            pathname: "/workout-detail",
            params: { workoutId: item.id },
        });
    };

    // Navegación a Edición
    const handleEdit = () => {
        const route = item.type === "gym" ? "./gym" : "./runner";
        router.push({
            pathname: route as any,
            params: { dayKey: item.day, workoutId: item.id },
        });
    };

    const renderIcon = () => {
        switch (item.type) {
            case "gym":
                return (
                    <MaterialCommunityIcons
                        name="weight-lifter"
                        size={22}
                        color={colors.accent}
                        style={styles.cardIcon}
                    />
                );
            case "runner":
                return (
                    <MaterialCommunityIcons
                        name="run"
                        size={22}
                        color={colors.accent}
                        style={styles.cardIcon}
                    />
                );
            case "youtube":
                return (
                    <MaterialCommunityIcons
                        name="youtube"
                        size={22}
                        color="red"
                        style={styles.cardIcon}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <View style={styles.cardWrapper}>
            <TouchableOpacity
                style={[
                    styles.card,
                    {
                        backgroundColor: colors.cardItem,
                        borderColor: colors.border,
                    },
                ]}
                onPress={handleViewDetail}
                disabled={item.type === "youtube"}
                activeOpacity={0.7}
            >
                <View style={styles.content}>
                    <View style={styles.titleRow}>
                        {renderIcon()}
                        <Text
                            style={[styles.title, { color: colors.text }]}
                            numberOfLines={2}
                        >
                            {item.text}
                        </Text>
                    </View>

                    {description ? (
                        <Text
                            style={[
                                styles.subTitle,
                                { color: colors.textMuted },
                            ]}
                        >
                            {description}
                        </Text>
                    ) : null}

                    {item.type === "youtube" && item.youtubeUrl ? (
                        <TouchableOpacity
                            style={[
                                styles.trainingLinkButton,
                                { backgroundColor: colors.secondaryAccent },
                            ]}
                            onPress={() => setYtModalVisible(true)}
                        >
                            <MaterialCommunityIcons
                                name="television-play"
                                size={16}
                                color="#fff"
                            />
                            <Text style={styles.trainingLinkText}>
                                TRAINING LINK
                            </Text>
                        </TouchableOpacity>
                    ) : null}
                </View>

                {/* BOTONES DE ACCIÓN (Lápiz oculto para crear próximamente) */}
                <View style={styles.actionsContainer}>
                    {item.type !== "youtube" && (
                        <TouchableOpacity
                            onPress={handleEdit}
                            style={styles.actionButton}
                        >
                            {/* <MaterialIcons
                                name="edit"
                                size={20}
                                color={colors.textMuted}
                            /> */}
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        onPress={() => onDelete(item.id)}
                        style={styles.actionButton}
                    >
                        <MaterialIcons
                            name="delete-outline"
                            size={22}
                            color="red"
                        />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>

            {item.type === "youtube" && (
                <YoutubeBrowserModal
                    visible={ytModalVisible}
                    onClose={() => setYtModalVisible(false)}
                    onSelectVideo={async (title, url) => {
                        setYtModalVisible(false);
                    }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    cardWrapper: { paddingHorizontal: 4, width: "100%" },
    card: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 12,
        elevation: 2,
    },
    content: { flex: 1, alignItems: "flex-start" },
    titleRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
        paddingRight: 10,
    },
    cardIcon: { marginRight: 8 },
    title: { fontWeight: "800", fontSize: 14, lineHeight: 20, flexShrink: 1 },
    subTitle: { fontSize: 12, fontWeight: "600", marginLeft: 30, marginTop: 2 },
    actionsContainer: { flexDirection: "row", alignItems: "center" },
    actionButton: {
        padding: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    trainingLinkButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 10,
        marginTop: 10,
        marginLeft: 30,
    },
    trainingLinkText: {
        color: "#fff",
        fontWeight: "900",
        fontSize: 11,
        letterSpacing: 0.5,
    },
});


