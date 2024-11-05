import React, { useMemo } from "react";
import { Card, Button, Text, Avatar, Divider } from 'react-native-paper';
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { deleteWaterData } from "@/store/trackSlice";
import { WaterDataEntry, WaterDataState } from "../../types/track";
import { View, Animated } from "react-native";
import { setDialog, DialogTab, DialogType } from "@/store/trackDialogSlice";

export default function TrackWaterCard() {
    const dispatch = useDispatch<AppDispatch>();
    const { currentMonth, waterData, currentDate } = useSelector((state: RootState) => state.track);
    const formattedMonth = `${currentMonth.year}-${currentMonth.month}`;
    const fadeAnim = React.useRef(new Animated.Value(1)).current;

    React.useEffect(() => {
        fadeAnim.setValue(0); // Reset the animation value
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, [currentDate]); // Only depend on currentMonth changes, removed currentDate dependency

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
                    <Card style={{ margin: 10 }}>
                        <Card.Title
                            title={`${water.intake_amount} ${water.waterType.charAt(0).toUpperCase()}${water.waterType.slice(1).toLowerCase()}`}
                            left={(props) => <Avatar.Icon {...props} icon="glass-pint-outline" color="#fff" />}
                        />
                        <Card.Actions style={{ alignSelf: 'flex-start' }}>
                            <Button
                                icon="delete"
                                onPress={() => water.id && dispatch(deleteWaterData({ currentDate, docId: water.id }))}
                            >
                                Delete
                            </Button>
                            <Button
                                icon="pencil"
                                onPress={() => dispatch(setDialog({
                                    showDialog: true,
                                    dialogTab: DialogTab.WATER,
                                    dialogType: DialogType.EDIT
                                }))}
                            >
                                Edit
                            </Button>
                        </Card.Actions>
                    </Card>
                </Animated.View>
            ))}
        </View>
    );
}