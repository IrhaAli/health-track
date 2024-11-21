import React, { useEffect, useState, useMemo, useCallback } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { Avatar, Button, Text } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { fetchDietData, fetchSleepData, fetchWaterData, fetchWeightData, setCurrentMonth } from "@/store/trackSlice";
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from "@/services/i18n";
import ChartComponent from "./chart";
import { Colors } from "@/app/theme";
const CHART_CONFIG = [
  { type: 'meal', color: '#FF9800', titleKey: 'dailyMealCount', noDataKey: 'noMealData' },
  { type: 'fasting', color: '#4CAF50', titleKey: 'dailyFastingHours', noDataKey: 'noFastingData' },
  { type: 'water', color: '#2196F3', titleKey: 'waterIntakeTitle', noDataKey: 'noWaterData' },
  { type: 'sleep', color: '#673AB7', titleKey: 'sleepDurationTitle', noDataKey: 'noSleepData' },
  { type: 'weight', color: '#9C27B0', titleKey: 'weightTitle', noDataKey: 'noWeightData' }
] as const;

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

    const fetchAllData = useCallback(async (user: any) => {
        const fetchParams = { month: currentMonth.month, year: currentMonth.year, userId: user.uid };
        const fetchActions = [
            fetchWeightData(fetchParams),
            fetchDietData(fetchParams),
            fetchWaterData(fetchParams),
            fetchSleepData(fetchParams)
        ];
        await Promise.all(fetchActions.map(action => dispatch(action as any)));
    }, [currentMonth, dispatch]);

    useEffect(() => {
        const initializeData = async () => {
            try {
                const userString = await AsyncStorage.getItem('session');
                if (userString) {
                    const user = JSON.parse(userString);
                    setCurrentUser(user);
                    await fetchAllData(user);
                }
            } catch (error) {
                console.error('Error initializing data:', error);
            }
        };

        initializeData();
    }, [fetchAllData]);

    useEffect(() => {
        setDisableNextButton(year > todayYear || (year === todayYear && month >= todayMonth));
        setDisablePrevButton(month === 1 && year === todayYear);
    }, [month, year, todayMonth, todayYear]);

    const navigateMonth = useCallback((increment: number) => {
        let newMonth = month + increment;
        let newYear = year;

        if (newMonth > 12) {
            newMonth = 1;
            newYear++;
        } else if (newMonth < 1) {
            newMonth = 12;
            newYear--;
        }

        dispatch(setCurrentMonth({
            month: newMonth.toString().padStart(2, '0'),
            year: newYear.toString()
        }));
    }, [month, year, dispatch]);

    const renderNavigationButton = useCallback((icon: string, onPress: () => void, disabled: boolean) => (
        <Button
            icon={() => (
                <Avatar.Icon
                    size={30}
                    icon={icon}
                    color='#fff'
                    style={{ backgroundColor: disabled ? '#B0B0B0' : Colors.light.submitButton }} />
            )}
            mode="text"
            onPress={onPress}
            disabled={disabled} children={undefined} />
    ), []);

    const monthName = useMemo(() => {
        const date = new Date(year, month - 1);
        return date.toLocaleString(i18n.locale, { month: 'long' });
    }, [month, year]);

    const isRTL = i18n.locale === 'ar';

    return (
        <View style={styles.container}>
            <View style={[styles.calendarParent, { flexDirection: 'row' }]}>
                {renderNavigationButton(
                    isRTL ? 'chevron-right' : 'chevron-left', 
                    () => navigateMonth(-1), 
                    disablePrevButton
                )}
                <Text variant="titleLarge">{monthName.charAt(0).toUpperCase() + monthName.slice(1)} {year}</Text>
                {renderNavigationButton(
                    isRTL ? 'chevron-left' : 'chevron-right', 
                    () => navigateMonth(1), 
                    disableNextButton
                )}
            </View>

            <ScrollView>
                {CHART_CONFIG.map(({ type, color, titleKey, noDataKey }) => (
                    <ChartComponent
                        key={type}
                        type={type}
                        color={color}
                        title={i18n.t(titleKey)}
                        noDataText={i18n.t(noDataKey)}
                    />
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    calendarParent: {
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 30,
        paddingVertical: 10,
    }
});
