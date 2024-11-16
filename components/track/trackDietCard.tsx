import React, { useMemo } from "react";
import { Button, Text, Avatar, Divider, Surface, Portal, Dialog } from 'react-native-paper';
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { DietDataEntry } from "../../types/track";
import { deleteDietData } from "@/store/trackSlice";
import { Image, View, Animated, StyleSheet } from "react-native";
import { setDialog, DialogTab, DialogType } from "@/store/trackDialogSlice";
import i18n from "@/services/i18n";

export default function TrackDietCard() {
    const dispatch = useDispatch<AppDispatch>();
    const { currentMonth, dietData, currentDate } = useSelector((state: RootState) => state.track);
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

    const dietEntries = useMemo(() => (
        (!Array.isArray(dietData) && dietData[formattedMonth]?.length > 0) 
            ? dietData[formattedMonth].filter((entry: DietDataEntry) => 
                new Date(entry.date).toLocaleDateString().split('/').reverse().join('-') === currentDate)
            : []
    ), [dietData, formattedMonth, currentDate]);

    if (!dietEntries.length) return null;

    const handleDelete = (id: string) => {
        dispatch(deleteDietData({ currentDate, docId: id }));
        setDeleteDialog({ visible: false, id: null });
    };

    return (
        <View>
            <Portal>
                <Dialog visible={deleteDialog.visible} onDismiss={() => setDeleteDialog({ visible: false, id: null })}>
                    <Dialog.Title>{i18n.t('trackDietCard.confirmDelete')}</Dialog.Title>
                    <Dialog.Content>
                        <Text>{i18n.t('trackDietCard.confirmDeleteMessage')}</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button mode="text" textColor="#666" onPress={() => setDeleteDialog({ visible: false, id: null })}>
                            {i18n.t('trackDietCard.cancel')}
                        </Button>
                        <Button mode="contained" onPress={() => deleteDialog.id && handleDelete(deleteDialog.id)}>
                            {i18n.t('trackDietCard.confirm')}
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            {dietEntries.map((diet: DietDataEntry, index: number) => (
                <Animated.View key={diet.id || index} style={[styles.fadeIn, { opacity: fadeAnim }]}>
                    <Divider />
                    <Surface style={styles.surface} elevation={0}>
                        <View style={styles.contentContainer}>
                            <View style={styles.headerContainer}>
                                <Avatar.Icon size={40} icon="food" color="#fff" style={styles.avatar} />
                                <Text variant="titleLarge" style={styles.title}>
                                    {`${i18n.t('trackDietCard.mealAt')}: ${new Date(diet.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                                </Text>
                            </View>
                            
                            {diet.meal_picture && (
                                <Image style={styles.mealImage} source={{ uri: diet.meal_picture }} />
                            )}
                            
                            <View style={styles.buttonContainer}>
                                <Button
                                    mode="contained-tonal"
                                    icon="delete"
                                    onPress={() => diet.id && setDeleteDialog({ visible: true, id: diet.id })}
                                    style={styles.button}
                                >
                                    {i18n.t('trackDietCard.delete')}
                                </Button>
                                <Button
                                    mode="contained"
                                    icon="pencil"
                                    onPress={() => dispatch(setDialog({
                                        showDialog: true,
                                        dialogTab: DialogTab.DIET,
                                        dialogType: DialogType.EDIT
                                    }))}
                                    style={styles.button}
                                >
                                    {i18n.t('trackDietCard.edit')}
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
        backgroundColor: '#FF9800'
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
        flex: 1
    },
    mealImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        resizeMode: 'contain',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        overflow: 'hidden',
        backgroundColor: '#fff'
    },
    fadeIn: {
        transform: [{
            translateY: 20
        }]
    }
});