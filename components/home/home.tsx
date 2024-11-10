import React, { useEffect, useState, useMemo } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { Avatar, Button, Divider, Text } from "react-native-paper";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedView } from "@/components/ThemedView";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { fetchDietData, fetchSleepData, fetchWaterData, fetchWeightData, setCurrentMonth } from "@/store/trackSlice";
import AsyncStorage from '@react-native-async-storage/async-storage';
import MealChartComponent from "./meal";
import WaterChartComponent from "./water";
import SleepChartComponent from "./sleep";
import WeightChartComponent from "./weight";
import FastingChartComponent from "./fasting";
import translations from "@/translations/home.json";

const MONTH_NAMES = {
    en: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ],
    fr: [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ],
    ar: [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ]
};

export default function HomeComponent() {
    const [disablePrevButton, setDisablePrevButton] = useState(false);
    const [disableNextButton, setDisableNextButton] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [currentLanguage, setCurrentLanguage] = useState<string>('en');
    const [isLanguageLoaded, setIsLanguageLoaded] = useState(false);

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

    // Initialize language
    useEffect(() => {
        const initLanguage = async () => {
            try {
                const savedLanguage = await AsyncStorage.getItem('userLanguage');
                if (savedLanguage) {
                    setCurrentLanguage(savedLanguage);
                }
            } catch (error) {
                console.error('Error getting language:', error);
            } finally {
                setIsLanguageLoaded(true);
            }
        };
        initLanguage();
    }, []);

    // Listen for language changes
    useEffect(() => {
        const checkLanguageChanges = async () => {
            try {
                const newLanguage = await AsyncStorage.getItem('userLanguage');
                if (newLanguage && newLanguage !== currentLanguage) {
                    setCurrentLanguage(newLanguage);
                }
            } catch (error) {
                console.error('Error checking language changes:', error);
            }
        };

        const intervalId = setInterval(checkLanguageChanges, 1000);

        return () => {
            clearInterval(intervalId);
        };
    }, [currentLanguage]);

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

    if (!isLanguageLoaded) {
        return null;
    }

    return (
        <ScrollView style={styles.container}>
            <View style={[styles.calendarParent, {
                flexDirection: currentLanguage === 'ar' ? 'row-reverse' : 'row'
            }]}>
                {renderNavigationButton(currentLanguage === 'ar' ? 'chevron-right' : 'chevron-left', navPrev, disablePrevButton)}
                <Text variant="titleLarge">{MONTH_NAMES[currentLanguage as keyof typeof MONTH_NAMES][month - 1]} {year}</Text>
                {renderNavigationButton(currentLanguage === 'ar' ? 'chevron-left' : 'chevron-right', navNext, disableNextButton)}
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
