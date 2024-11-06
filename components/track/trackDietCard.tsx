import React, { useMemo } from "react";
import { Card, Button, Text, Avatar, Divider } from 'react-native-paper';
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { DietDataEntry, DietDataState } from "../../types/track";
import { deleteDietData } from "@/store/trackSlice";
import { Image, View, Animated } from "react-native";
import { setDialog, DialogTab, DialogType } from "@/store/trackDialogSlice";

export default function TrackDietCard() {
    const dispatch = useDispatch<AppDispatch>();
    const { currentMonth, dietData, currentDate } = useSelector((state: RootState) => state.track);
    const formattedMonth = `${currentMonth.year}-${currentMonth.month}`;
    const fadeAnim = React.useRef(new Animated.Value(1)).current;
    const LeftContent = (props: any) => <Avatar.Icon {...props} icon="food" color="#fff" />;

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

    if (!dietEntries.length) return null;

    return (
        <View>
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
                    <Card style={{ margin: 10 }}>
                        <Card.Title 
                            title={`Meal at: ${new Date(diet.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`} 
                            left={LeftContent} 
                        />
                        <Card.Content>
                            <Image 
                                style={[{ width: 100, height: 150, objectFit: 'contain', alignSelf: 'center' }]} 
                                source={{ uri: diet.meal_picture }} 
                            />
                        </Card.Content>
                        <Card.Actions style={[{ alignSelf: 'flex-start' }]}>
                            <Button 
                                icon="delete" 
                                onPress={() => diet.id && dispatch(deleteDietData({ currentDate, docId: diet.id }))}
                            >
                                Delete
                            </Button>
                            <Button 
                                icon="pencil" 
                                onPress={() => dispatch(setDialog({
                                    showDialog: true,
                                    dialogTab: DialogTab.DIET,
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