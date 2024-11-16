import React, { useMemo } from "react";
import { Button, Text, Avatar, Divider, Surface, Portal, Dialog } from 'react-native-paper';
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { deleteWeightData } from "@/store/trackSlice";
import { WeightDataEntry } from "../../types/track";
import { Image, View, Animated, StyleSheet } from "react-native";
import { setDialog, DialogTab, DialogType } from "@/store/trackDialogSlice";
import i18n from "@/services/i18n";

export default function TrackWeightCard() {
    const dispatch = useDispatch<AppDispatch>();
    const { currentMonth, weightData, currentDate } = useSelector((state: RootState) => state.track);
    const formattedMonth = `${currentMonth.year}-${currentMonth.month}`;
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const [deleteDialog, setDeleteDialog] = React.useState({ visible: false, id: null as string | null });

    React.useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, [currentDate]);

    const weightEntries = useMemo(() => {
        if (!Array.isArray(weightData) && weightData[formattedMonth]?.length) {
            return weightData[formattedMonth].filter((entry: WeightDataEntry) => {
                const date = new Date(entry.date);
                const { timeZone } = Intl.DateTimeFormat().resolvedOptions();
                return date.toLocaleDateString('en-CA', { timeZone }) === currentDate;
            });
        }
        return [];
    }, [weightData, formattedMonth, currentDate]);

    if (!weightEntries.length) return null;

    const handleDelete = () => {
        if (deleteDialog.id) {
            dispatch(deleteWeightData({ currentDate, docId: deleteDialog.id }));
            setDeleteDialog({ visible: false, id: null });
        }
    };

    return (
        <View>
            <Portal>
                <Dialog visible={deleteDialog.visible} onDismiss={() => setDeleteDialog({ ...deleteDialog, visible: false })}>
                    <Dialog.Title>{i18n.t('trackWeightCard.confirmDelete')}</Dialog.Title>
                    <Dialog.Content>
                        <Text>{i18n.t('trackWeightCard.confirmDeleteMessage')}</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button mode="text" textColor="#666" onPress={() => setDeleteDialog({ ...deleteDialog, visible: false })}>
                            {i18n.t('trackWeightCard.cancel')}
                        </Button>
                        <Button mode="contained" onPress={handleDelete}>
                            {i18n.t('trackWeightCard.confirm')}
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            {weightEntries.map((weight: WeightDataEntry, index: number) => (
                <Animated.View
                    key={weight.id || index}
                    style={{
                        opacity: fadeAnim,
                        transform: [{
                            translateY: fadeAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [20, 0]
                            })
                        }]
                    }}
                >
                    <Divider />
                    <Surface style={styles.surface} elevation={0}>
                        <View style={styles.contentContainer}>
                            <View style={styles.headerContainer}>
                                <Avatar.Icon size={40} icon="weight" color="#fff" style={styles.avatar} />
                                <Text variant="titleLarge" style={styles.title}>
                                    {i18n.t('trackWeightCard.title', { weight: weight.weight, unit: weight.measurement_unit })}
                                </Text>
                            </View>
                            
                            {weight.picture && (
                                <Image 
                                    style={styles.weightImage}
                                    source={{ uri: weight.picture }} 
                                />
                            )}
                            
                            <View style={styles.buttonContainer}>
                                <Button
                                    mode="contained-tonal"
                                    icon="delete"
                                    onPress={() => weight.id && setDeleteDialog({ visible: true, id: weight.id })}
                                    style={styles.button}
                                >
                                    {i18n.t('trackWeightCard.delete')}
                                </Button>
                                <Button
                                    mode="contained"
                                    icon="pencil"
                                    onPress={() => dispatch(setDialog({
                                        showDialog: true,
                                        dialogTab: DialogTab.WEIGHT,
                                        dialogType: DialogType.EDIT
                                    }))}
                                    style={styles.button}
                                >
                                    {i18n.t('trackWeightCard.edit')}
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
        backgroundColor: '#9C27B0'
    },
    title: {
        flex: 1,
        fontWeight: '600'
    },
    weightImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        resizeMode: 'contain',
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        overflow: 'hidden'
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 8,
        width: '50%',
        alignSelf: 'flex-start'
    },
    button: {
        flex: 1
    }
});