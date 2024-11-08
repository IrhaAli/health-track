import React, { useEffect, useState, useMemo } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { Avatar, Button, Divider, Text } from "react-native-paper";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedView } from "@/components/ThemedView";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { fetchDietData, fetchSleepData, fetchWaterData, fetchWeightData, setCurrentMonth } from "@/store/trackSlice";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import MealChartComponent from "./meal";
import WaterChartComponent from "./water";
import SleepChartComponent from "./sleep";
import WeightChartComponent from "./weight";
import FastingChartComponent from "./fasting";

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export default function HomeComponent() {
    const [disablePrevButton, setDisablePrevButton] = useState(false);
    const [disableNextButton, setDisableNextButton] = useState(true);
    const [currentUser, setCurrentUser] = useState(getAuth().currentUser);

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

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
            setCurrentUser(user);
        });

        return () => unsubscribe();
    }, []);

    // Fetch data function
    const fetchAllData = async () => {
        if (!currentUser?.uid) {
            return;
        }
        
        
        try {
            await Promise.all([
                dispatch(fetchWeightData({ month: currentMonth.month, year: currentMonth.year, userId: currentUser.uid })),
                dispatch(fetchDietData({ month: currentMonth.month, year: currentMonth.year, userId: currentUser.uid })),
                dispatch(fetchWaterData({ month: currentMonth.month, year: currentMonth.year, userId: currentUser.uid })),
                dispatch(fetchSleepData({ month: currentMonth.month, year: currentMonth.year, userId: currentUser.uid }))
            ]);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    // Initial data fetch
    useEffect(() => {
        if (currentUser) {
            fetchAllData();
        }
    }, [currentUser]); // Depends on currentUser instead of user?.uid

    // Update data on month change
    useEffect(() => {
        setDisableNextButton(year > todayYear || (year === todayYear && month >= todayMonth));
        setDisablePrevButton(month === 1 && year === todayYear);
        if (currentUser) {
            fetchAllData();
        }
    }, [currentMonth, currentUser]);

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

    return (
        <ScrollView style={styles.container}>
            <View style={styles.calendarParent}>
                {renderNavigationButton('chevron-left', navPrev, disablePrevButton)}
                <Text variant="titleLarge">{MONTH_NAMES[month - 1]} {year}</Text>
                {renderNavigationButton('chevron-right', navNext, disableNextButton)}
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
        flexDirection: 'row',
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
