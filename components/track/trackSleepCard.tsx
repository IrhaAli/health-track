import React, { useMemo, useState } from "react";
import { Button, Text, Avatar, Divider, Surface, Portal, Dialog } from 'react-native-paper';
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { SleepDataEntry } from "../../types/track";
import { deleteSleepData } from "@/store/trackSlice";
import { View, Animated, StyleSheet } from "react-native";
import { setDialog, DialogTab, DialogType } from "@/store/trackDialogSlice";

export default function TrackSleepCard() {
    const dispatch = useDispatch<AppDispatch>();
    const { currentMonth, sleepData, currentDate } = useSelector((state: RootState) => state.track);
    const formattedMonth = `${currentMonth.year}-${currentMonth.month}`;
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const [deleteDialog, setDeleteDialog] = useState({ visible: false, id: null as string | null });

    React.useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, [currentDate]);

    const formatDuration = (mins: number) => `${Math.floor(mins / 60)}h ${mins % 60}m`;

    const sleepEntries = useMemo(() => {
        if (!Array.isArray(sleepData) && sleepData[formattedMonth]?.length) {
            return sleepData[formattedMonth].filter((entry: SleepDataEntry) => {
                const date = new Date(entry.wakeup_time);
                const { timeZone } = Intl.DateTimeFormat().resolvedOptions();
                return date.toLocaleDateString('en-CA', { timeZone }) === currentDate;
            });
        }
        return [];
    }, [sleepData, formattedMonth, currentDate]);

    if (!sleepEntries.length) return null;

    const handleDelete = () => {
        if (deleteDialog.id) {
            dispatch(deleteSleepData({ currentDate, docId: deleteDialog.id }));
            setDeleteDialog({ visible: false, id: null });
        }
    };

    return (
        <View>
            <Portal>
                <Dialog visible={deleteDialog.visible} onDismiss={() => setDeleteDialog({ ...deleteDialog, visible: false })}>
                    <Dialog.Title>Confirm Delete</Dialog.Title>
                    <Dialog.Content>
                        <Text>Are you sure you want to delete this sleep entry?</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button mode="text" textColor="#666" onPress={() => setDeleteDialog({ ...deleteDialog, visible: false })}>Cancel</Button>
                        <Button mode="contained" onPress={handleDelete}>Confirm</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            {sleepEntries.map((sleep: SleepDataEntry, index: number) => (
                <Animated.View
                    key={sleep.id || index}
                    style={[styles.fadeIn, { opacity: fadeAnim }]}
                >
                    <Divider />
                    <Surface style={styles.surface} elevation={0}>
                        <View style={styles.content}>
                            <View style={styles.header}>
                                <Avatar.Icon size={40} icon="moon-waning-crescent" color="#fff" style={styles.avatar} />
                                <View style={styles.titleBox}>
                                    <Text variant="titleLarge" style={styles.title}>
                                        Sleep Duration: {formatDuration(sleep.sleep_duration)}
                                    </Text>
                                    <Text variant="titleMedium">Quality: {sleep.sleep_quality}/5</Text>
                                </View>
                            </View>
                            
                            <View style={styles.buttons}>
                                <Button
                                    mode="contained-tonal"
                                    icon="delete"
                                    onPress={() => sleep.id && setDeleteDialog({ visible: true, id: sleep.id })}
                                    style={styles.btn}
                                >
                                    Delete
                                </Button>
                                <Button
                                    mode="contained"
                                    icon="pencil"
                                    onPress={() => dispatch(setDialog({
                                        showDialog: true,
                                        dialogTab: DialogTab.SLEEP,
                                        dialogType: DialogType.EDIT
                                    }))}
                                    style={styles.btn}
                                >
                                    Edit
                                </Button>
                            </View>
                        </View>
                    </Surface>
                </Animated.View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    surface: {
        margin: 10,
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#fff'
    },
    content: { gap: 16 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12
    },
    avatar: { backgroundColor: '#673AB7' },
    titleBox: { flex: 1 },
    title: { fontWeight: '600' },
    buttons: {
        width: '50%',
        flexDirection: 'row',
        gap: 8,
        alignSelf: 'flex-start'
    },
    btn: { flex: 1 },
    fadeIn: {
        transform: [{
            translateY: 20
        }]
    }
});