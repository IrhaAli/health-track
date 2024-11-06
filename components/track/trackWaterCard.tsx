import React, { useMemo } from "react";
import { Button, Text, Avatar, Divider, Surface } from 'react-native-paper';
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { deleteWaterData } from "@/store/trackSlice";
import { WaterDataEntry, WaterDataState } from "../../types/track";
import { View, Animated, StyleSheet } from "react-native";
import { setDialog, DialogTab, DialogType } from "@/store/trackDialogSlice";

export default function TrackWaterCard() {
    const dispatch = useDispatch<AppDispatch>();
    const { currentMonth, waterData, currentDate } = useSelector((state: RootState) => state.track);
    const formattedMonth = `${currentMonth.year}-${currentMonth.month}`;
    const fadeAnim = React.useRef(new Animated.Value(1)).current;

    React.useEffect(() => {
        fadeAnim.setValue(0);
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, [currentDate]);

    const waterEntries = useMemo(() => {
        if (!Array.isArray(waterData) && waterData[formattedMonth]?.length > 0) {
            return waterData[formattedMonth].filter((entry: WaterDataEntry) =>
                new Date(entry.date).toLocaleDateString().split('/').reverse().join('-') === currentDate
            );
        }
        return [];
    }, [waterData, formattedMonth, currentDate]);

    if (!waterEntries.length) return null;

    return (
        <View>
            {waterEntries.map((water: WaterDataEntry, index: number) => (
                <Animated.View
                    key={water.id || index}
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
                                    icon="glass-pint-outline" 
                                    color="#fff" 
                                    style={styles.avatar}
                                />
                                <Text variant="titleLarge" style={styles.title}>
                                    {`${water.intake_amount} ${water.waterType.charAt(0).toUpperCase()}${water.waterType.slice(1).toLowerCase()}`}
                                </Text>
                            </View>
                            
                            <View style={[styles.buttonContainer, { width: '50%', alignSelf: 'flex-start' }]}>
                                <Button
                                    mode="contained-tonal"
                                    icon="delete"
                                    onPress={() => water.id && dispatch(deleteWaterData({ currentDate, docId: water.id }))}
                                    style={styles.button}
                                >
                                    Delete
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
        backgroundColor: '#2196F3'
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