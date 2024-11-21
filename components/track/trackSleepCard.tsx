import React, { useMemo, useState } from "react";
import { Button, Text, Avatar, Divider, Surface, Portal, Dialog } from 'react-native-paper';
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { SleepDataEntry } from "../../types/track";
import { deleteSleepData, getSleepDataForDate } from "@/store/trackSlice";
import { View, Animated, StyleSheet } from "react-native";
import { setDialog, DialogTab, DialogType } from "@/store/trackDialogSlice";
import i18n from "@/services/i18n";
import { Colors } from "@/app/theme";

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

    const sleepEntries = useMemo(() => getSleepDataForDate(sleepData, currentDate), [sleepData, currentDate]);

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
                    <Dialog.Title>{i18n.t('trackSleepCard.confirmDelete.title')}</Dialog.Title>
                    <Dialog.Content>
                        <Text>{i18n.t('trackSleepCard.confirmDelete.message')}</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button mode="text" textColor="#666" onPress={() => setDeleteDialog({ ...deleteDialog, visible: false })}>
                            {i18n.t('trackSleepCard.confirmDelete.cancel')}
                        </Button>
                        <Button mode="contained" onPress={handleDelete}>
                            {i18n.t('trackSleepCard.confirmDelete.confirm')}
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            {sleepEntries.map((sleep: SleepDataEntry, index: number) => (
                <Animated.View
                    key={sleep.id || index}
                    style={[styles.fadeIn, {
                        opacity: fadeAnim,
                        transform: [{
                            translateY: fadeAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [20, 0]
                            })
                        }]
                    }]}
                >
                    <Divider />
                    <Surface style={styles.surface} elevation={0}>
                        <View style={styles.content}>
                            <View style={styles.header}>
                                <Avatar.Icon size={40} icon="moon-waning-crescent" color="#fff" style={styles.avatar} />
                                <View style={styles.titleBox}>
                                    <Text variant="titleLarge" style={styles.title}>
                                        {i18n.t('trackSleepCard.sleepDuration')}: {formatDuration(sleep.sleep_duration)}
                                    </Text>
                                    <Text variant="titleMedium">{i18n.t('trackSleepCard.quality')}: {sleep.sleep_quality}/5</Text>
                                </View>
                            </View>
                            
                            <View style={styles.buttons}>
                                <Button
                                    mode="contained-tonal"
                                    icon="delete"
                                    onPress={() => sleep.id && setDeleteDialog({ visible: true, id: sleep.id })}
                                    style={styles.btn}
                                >
                                    {i18n.t('trackSleepCard.delete')}
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
                                    buttonColor={Colors.light.submitButton}
                                >
                                    {i18n.t('trackSleepCard.edit')}
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
        width: '100%',
        transform: [{
            translateY: 20
        }]
    }
});