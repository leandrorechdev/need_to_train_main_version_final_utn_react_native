import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function GymDisplayCard({ data, modalidad }: { data: any, modalidad: string }) {
    const colors = useAppTheme();
    
    return (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.accent }]}>MODALIDAD: {modalidad.toUpperCase()}</Text>
            {Object.entries(data).map(([key, value]) => (
                <View key={key} style={styles.row}>
                    <Text style={[styles.label, { color: colors.textMuted }]}>{key.toUpperCase()}:</Text>
                    <Text style={[styles.value, { color: colors.text }]}>{value as string}</Text>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    card: { padding: 20, borderRadius: 15, borderWidth: 1 },
    title: { fontWeight: '900', marginBottom: 15, fontSize: 16 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    label: { fontWeight: 'bold' },
    value: { fontWeight: '600' }
});