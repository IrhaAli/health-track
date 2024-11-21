import React, { useMemo, useState } from "react";
import { Button, Text, Avatar, Divider, Surface, Portal, Dialog } from 'react-native-paper';
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { deleteWaterData } from "@/store/trackSlice";
import { WaterDataEntry } from "../../types/track";
import { View, Animated, StyleSheet } from "react-native";
import { setDialog, DialogTab, DialogType } from "@/store/trackDialogSlice";
import i18n from "@/services/i18n";
import { getWaterDataForDate } from "@/store/trackSlice";
import { Colors } from "@/app/theme";

export default function TrackWaterCard() {
    const dispatch = useDispatch<AppDispatch>();
    const { currentMonth, waterData, currentDate } = useSelector((state: RootState) => state.track);
    const formattedMonth = `${currentMonth.year}-${currentMonth.month}`;
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const [deleteDialog, setDeleteDialog] = useState<{visible: boolean, id: string | null}>({
        visible: false,
        id: null
    });

    React.useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, [currentDate]);

    const waterEntries = useMemo(() => getWaterDataForDate(waterData, currentDate), [waterData, currentDate]);

    if (!waterEntries.length) return null;

    const handleDelete = (id: string) => {
        if (id) {
            dispatch(deleteWaterData({ currentDate, docId: id }));
        }
        setDeleteDialog({visible: false, id: null});
    };

    return (
        <View>
            <Portal>
                <Dialog visible={deleteDialog.visible} onDismiss={() => setDeleteDialog({...deleteDialog, visible: false})}>
                    <Dialog.Title>{i18n.t('trackWaterCard.confirmDelete.title')}</Dialog.Title>
                    <Dialog.Content>
                        <Text>{i18n.t('trackWaterCard.confirmDelete.message')}</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setDeleteDialog({...deleteDialog, visible: false})}>
                            {i18n.t('trackWaterCard.confirmDelete.cancel')}
                        </Button>
                        <Button mode="contained" onPress={() => handleDelete(deleteDialog.id!)}>
                            {i18n.t('trackWaterCard.confirmDelete.confirm')}
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            {waterEntries.map((water: WaterDataEntry, index: number) => (
                <Animated.View
                    key={water.id || index}
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
                        <View style={styles.contentContainer}>
                            <View style={styles.headerContainer}>
                                <Avatar.Icon 
                                    size={40} 
                                    icon="glass-pint-outline" 
                                    color="#fff"
                                    style={styles.avatar}
                                />
                                <Text variant="titleLarge" style={styles.title}>
                                    {`${water.intake_amount} ${water.waterType.charAt(0).toUpperCase()}${water.waterType.slice(1)}`}
                                </Text>
                            </View>
                            
                            <View style={styles.buttonContainer}>
                                <Button
                                    mode="contained-tonal"
                                    icon="delete"
                                    onPress={() => water.id && setDeleteDialog({visible: true, id: water.id})}
                                    style={styles.button}
                                >
                                    {i18n.t('trackWaterCard.delete')}
                                </Button>
                                <Button
                                    mode="contained"
                                    icon="pencil"
                                    onPress={() => dispatch(setDialog({
                                        showDialog: true,
                                        dialogTab: DialogTab.WATER,
                                        dialogType: DialogType.EDIT
                                    }))}
                                    style={styles.button}
                                    buttonColor={Colors.light.submitButton}
                                >
                                    {i18n.t('trackWaterCard.edit')}
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
        borderRadius: 12,
        backgroundColor: '#fff',
        padding: 16
    },
    contentContainer: {
        gap: 16
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12
    },
    avatar: {
        backgroundColor: '#2196F3'
    },
    title: {
        flex: 1,
        fontWeight: '600'
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 8,
        width: '50%',
        alignSelf: 'flex-start'
    },
    button: {
        flex: 1,
    },
    fadeIn: {
        width: '100%',
        transform: [{
            translateY: 20
        }]
    }
});