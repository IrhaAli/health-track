import { AppDispatch, RootState } from "../../store/store";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, Button, Divider, SegmentedButtons, Text } from "react-native-paper";
import { View, StyleSheet, InteractionManager } from "react-native";
import { fetchDietData, fetchWeightData, setCurrentMonth } from "@/store/trackSlice";
import AppMediaMealComponent from "./meal";
import AppMediaWeightComponent from "./weight";
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from "@/services/i18n";
import { Colors } from "@/app/theme";

enum MediaTabEnum {
    MEAL = 'meal',
    WEIGHT = 'weight'
}

export default function AppMediaComponent() {
    const [disablePrevButton, setDisablePrevButton] = useState(false);
    const [disableNextButton, setDisableNextButton] = useState(true);
    const [mediaTab, setMediaTab] = useState(MediaTabEnum.MEAL);
    const [isReady, setIsReady] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    const currentMonth = useSelector((state: RootState) => state.track.currentMonth);
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        const getUser = async () => {
            const userString = await AsyncStorage.getItem('session');
            if (userString) {
                const user = JSON.parse(userString);
                setCurrentUser(user);
            }
        };
        getUser();
    }, []);

    useEffect(() => {
        InteractionManager.runAfterInteractions(() => {
            setIsReady(true);
        });
    }, []);

    const { month, year, todayMonth, todayYear } = useMemo(() => {
        const today = new Date();
        return {
            month: parseInt(currentMonth.month),
            year: parseInt(currentMonth.year),
            todayMonth: today.getMonth() + 1,
            todayYear: today.getFullYear()
        };
    }, [currentMonth]);

    useEffect(() => {
        setDisableNextButton(year > todayYear || (year === todayYear && month >= todayMonth));
        setDisablePrevButton(month === 1 && year === todayYear);

        if (currentUser?.uid) {
            dispatch(fetchWeightData({ month: currentMonth.month, year: currentMonth.year, userId: currentUser.uid }));
            dispatch(fetchDietData({ month: currentMonth.month, year: currentMonth.year, userId: currentUser.uid }));
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

    const renderNavigationButton = (icon: string, onPress: () => void, disabled: boolean) => (
        <Button
            icon={() => (
                <Avatar.Icon
                    size={30}
                    icon={icon}
                    color='#fff'
                    style={[{ backgroundColor: disabled ? '#B0B0B0' : Colors.light.submitButton }]}
                />
            )}
            mode="text"
            onPress={onPress}
            disabled={disabled}
        >
            {''}
        </Button>
    );

    const MemoizedContent = useCallback(() => {
        return mediaTab === MediaTabEnum.MEAL ? <AppMediaMealComponent /> : <AppMediaWeightComponent />;
    }, [mediaTab]);

    const getMonthName = (monthNum: number) => {
        return i18n.t(`media.months.${[
            'january', 'february', 'march', 'april', 'may', 'june',
            'july', 'august', 'september', 'october', 'november', 'december'
        ][monthNum - 1]}`);
    };

    return (
        <>
            <View style={styles.mediaTabParent}>
                <SegmentedButtons
                    value={mediaTab}
                    onValueChange={(value) => setMediaTab(value as MediaTabEnum)}
                    buttons={[
                        { value: MediaTabEnum.MEAL, label: i18n.t('media.meal'), icon: 'food' },
                        { value: MediaTabEnum.WEIGHT, label: i18n.t('media.weight'), icon: 'weight' }
                    ]}
                />
            </View>

            <View style={styles.calendarParent}>
                {renderNavigationButton(i18n.locale === 'ar' ? 'chevron-right' : 'chevron-left', navPrev, disablePrevButton)}
                <Text variant="titleLarge">{getMonthName(month)} {year}</Text>
                {renderNavigationButton(i18n.locale === 'ar' ? 'chevron-left' : 'chevron-right', navNext, disableNextButton)}
            </View>
            <Divider style={styles.divider} />

            {isReady && <MemoizedContent />}
        </>
    );
}

const styles = StyleSheet.create({
    calendarParent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 30,
        paddingVertical: 10,
    },
    mediaTabParent: {
        marginTop: 43,
        paddingHorizontal: 10
    },
    divider: {
        marginBottom: 10
    }
});