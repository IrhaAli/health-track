import React, { useMemo, useState } from "react";
import { Button, Text, Avatar, Divider, Surface, Portal, Dialog } from 'react-native-paper';
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { DietDataEntry, DietDataState } from "../../types/track";
import { deleteDietData } from "@/store/trackSlice";
import { Image, View, Animated, StyleSheet } from "react-native";
import { setDialog, DialogTab, DialogType } from "@/store/trackDialogSlice";

export default function TrackDietCard() {
    const dispatch = useDispatch<AppDispatch>();
    const { currentMonth, dietData, currentDate } = useSelector((state: RootState) => state.track);
    const formattedMonth = `${currentMonth.year}-${currentMonth.month}`;
    const fadeAnim = React.useRef(new Animated.Value(1)).current;
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [selectedDietId, setSelectedDietId] = useState<string | null>(null);

    React.useEffect(() => {
        fadeAnim.setValue(0);
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, [currentDate]);

    const dietEntries = useMemo(() => {
        if (!Array.isArray(dietData) && dietData[formattedMonth]?.length > 0) {
            return dietData[formattedMonth].filter((entry: DietDataEntry) =>
                new Date(entry.date).toLocaleDateString().split('/').reverse().join('-') === currentDate
            );
        }
        return [];
    }, [dietData, formattedMonth, currentDate]);

    const handleDeletePress = (dietId: string) => {
        setSelectedDietId(dietId);
        setDeleteDialogVisible(true);
    };

    const handleConfirmDelete = () => {
        if (selectedDietId) {
            dispatch(deleteDietData({ currentDate, docId: selectedDietId }));
        }
        setDeleteDialogVisible(false);
    };

    if (!dietEntries.length) return null;

    return (
        <View>
            <Portal>
                <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
                    <Dialog.Title>Confirm Delete</Dialog.Title>
                    <Dialog.Content>
                        <Text>Are you sure you want to delete this meal entry?</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button mode="text" textColor="#666" onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
                        <Button mode="contained" onPress={handleConfirmDelete}>Confirm</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            {dietEntries.map((diet: DietDataEntry, index: number) => (
                <Animated.View
                    key={diet.id || index}
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
                                <Avatar.Icon 
                                    size={40} 
                                    icon="food" 
                                    color="#fff" 
                                    style={styles.avatar}
                                />
                                <Text variant="titleLarge" style={styles.title}>
                                    {`Meal at: ${new Date(diet.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                                </Text>
                            </View>
                            
                            {diet.meal_picture && (
                                <Image 
                                    style={{ 
                                        width: '100%',
                                        height: 200,
                                        borderRadius: 12,
                                        resizeMode: 'contain',
                                        shadowColor: '#000',
                                        shadowOffset: {
                                            width: 0,
                                            height: 2,
                                        },
                                        shadowOpacity: 0.25,
                                        shadowRadius: 3.84,
                                        overflow: 'hidden', // Ensure border radius is visible
                                        backgroundColor: '#fff' // Add background color to help with shadow
                                    }} 
                                    source={{ uri: diet.meal_picture }}
                                />
                            )}
                            
                            <View style={[styles.buttonContainer, { width: '50%', alignSelf: 'flex-start' }]}>
                                <Button
                                    mode="contained-tonal"
                                    icon="delete"
                                    onPress={() => diet.id && handleDeletePress(diet.id)}
                                    style={styles.button}
                                >
                                    Delete
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
        backgroundColor: '#FF9800' // Orange color for food/meals
    },
    title: {
        flex: 1,
        fontWeight: '600'
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 8
    },
    button: {
        flex: 1
    }
});