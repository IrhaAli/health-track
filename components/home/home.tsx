import React, { useEffect, useState, useMemo } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { Avatar, Button, Divider, Text } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { fetchDietData, fetchSleepData, fetchWaterData, fetchWeightData, setCurrentMonth } from "@/store/trackSlice";
import AsyncStorage from '@react-native-async-storage/async-storage';
import MealChartComponent from "./meal";
import WaterChartComponent from "./water";
import SleepChartComponent from "./sleep";
import WeightChartComponent from "./weight";
import FastingChartComponent from "./fasting";
import i18n from "@/i18n";

export default function HomeComponent() {
    const [disablePrevButton, setDisablePrevButton] = useState(false);
    const [disableNextButton, setDisableNextButton] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);

    const currentMonth = useSelector((state: RootState) => state.track.currentMonth);
    const dispatch = useDispatch<AppDispatch>();

    const { month, year, todayMonth, todayYear } = useMemo(() => {
        const today = new Date();
        return {
            month: parseInt(currentMonth.month),
            year: parseInt(currentMonth.year),
            todayMonth: today.getMonth() + 1,
            todayYear: today.getFullYear()
        };
    }, [currentMonth]);

    // Get user from AsyncStorage and fetch data
    useEffect(() => {
        const initializeData = async () => {
            try {
                const userString = await AsyncStorage.getItem('session');
                if (userString) {
                    const user = JSON.parse(userString);
                    setCurrentUser(user);
                    
                    // Fetch data only after we have the user
                    await Promise.all([
                        dispatch(fetchWeightData({ month: currentMonth.month, year: currentMonth.year, userId: user.uid })),
                        dispatch(fetchDietData({ month: currentMonth.month, year: currentMonth.year, userId: user.uid })),
                        dispatch(fetchWaterData({ month: currentMonth.month, year: currentMonth.year, userId: user.uid })),
                        dispatch(fetchSleepData({ month: currentMonth.month, year: currentMonth.year, userId: user.uid }))
                    ]);
                }
            } catch (error) {
                console.error('Error initializing data:', error);
            }
        };

        initializeData();
    }, [currentMonth]);

    // Update navigation button states
    useEffect(() => {
        setDisableNextButton(year > todayYear || (year === todayYear && month >= todayMonth));
        setDisablePrevButton(month === 1 && year === todayYear);
    }, [month, year, todayMonth, todayYear]);

    const navNext = () => {
        let newMonth = month + 1;
        let newYear = year;

        if (newMonth > 12) {
            newMonth = 1;
            newYear++;
        }

        dispatch(setCurrentMonth({
            month: newMonth.toString().padStart(2, '0'),
            year: newYear.toString()
        }));
    };

    const navPrev = () => {
        let newMonth = month - 1;
        let newYear = year;

        if (newMonth < 1) {
            newMonth = 12;
            newYear--;
        }

        dispatch(setCurrentMonth({
            month: newMonth.toString().padStart(2, '0'),
            year: newYear.toString()
        }));
    };

    const renderNavigationButton = useMemo(() => (icon: string, onPress: () => void, disabled: boolean) => (
        <Button
            icon={() => (
                <Avatar.Icon
                    size={30}
                    icon={icon}
                    color='#fff'
                    style={[{ backgroundColor: disabled ? '#B0B0B0' : 'tomato' }]}
                />
            )}
            mode="text"
            onPress={onPress}
            disabled={disabled}
        >
            {''}
        </Button>
    ), []);

    const monthName = useMemo(() => {
        const date = new Date(year, month - 1);
        return date.toLocaleString(i18n.locale, { month: 'long' });
    }, [month, year]);

    return (
        <ScrollView style={styles.container}>
            <View style={[styles.calendarParent, {
                flexDirection: 'row'
            }]}>
                {renderNavigationButton(i18n.locale === 'ar' ? 'chevron-right' : 'chevron-left', navPrev, disablePrevButton)}
                <Text variant="titleLarge">{monthName} {year}</Text>
                {renderNavigationButton(i18n.locale === 'ar' ? 'chevron-left' : 'chevron-right', navNext, disableNextButton)}
            </View>
            <MealChartComponent />
            <FastingChartComponent />
            <WaterChartComponent />
            <SleepChartComponent />
            <WeightChartComponent />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerPlaceholder: {
        height: 250,
        width: 400,
        backgroundColor: '#ccc'
    },
    calendarParent: {
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 30,
        paddingVertical: 10,
        marginTop: 43
    },
    divider: {
        marginBottom: 10
    }
});
