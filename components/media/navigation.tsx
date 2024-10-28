import { AppDispatch, RootState } from "../../store/store";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, Button, SegmentedButtons, Text } from "react-native-paper";
import { View, StyleSheet } from "react-native";
import { fetchDietData, fetchWeightData, setCurrentMonth } from "@/store/trackSlice";
import AppMediaMealComponent from "./meal";
import AppMediaWeightComponent from "./weight";
import { getAuth } from "firebase/auth";

enum MediaTabEnum {
    MEAL = 'meal',
    WEIGHT = 'weight'
}

export default function AppMediaNavitaionComponent() {
    const [disablePrevButton, setDisablePrevButton] = useState<boolean>(false);
    const [disableNextButton, setDisableNextButton] = useState<boolean>(true);
    const currentMonth = useSelector((state: RootState) => state.track.currentMonth);
    const dispatch = useDispatch<AppDispatch>();
    const [mediaTab, setMediaTab] = useState<MediaTabEnum>(MediaTabEnum.MEAL);
    const auth = getAuth();
    const user = auth?.currentUser;

    useEffect(() => {
        // Get current date
        const currentDate = new Date();
        const todayMonth = currentDate.getMonth() + 1; // Months are 0-indexed
        const todayYear = currentDate.getFullYear();

        const month = parseInt(currentMonth.month);
        const year = parseInt(currentMonth.year);

        // Set initial state for next button
        if (year > todayYear || (year === todayYear && month >= todayMonth)) {
            setDisableNextButton(true);
        } else {
            setDisableNextButton(false);
        }

        // Set initial state for previous button
        if (month === 1 && year === todayYear) {
            setDisablePrevButton(true);
        } else {
            setDisablePrevButton(false);
        }



        if (user?.uid && currentMonth.month && currentMonth.year) {
            dispatch(fetchWeightData({ month: String(currentMonth.month), year: String(currentMonth.year), userId: String(user.uid) }));
            dispatch(fetchDietData({ month: String(currentMonth.month), year: String(currentMonth.year), userId: String(user.uid) }));
        }


    }, [currentMonth]);

    const getMonthName = (monthNumber: string) => {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        // Convert the month number string to an integer and adjust for zero-based index
        const index = parseInt(monthNumber, 10) - 1;

        // Check if the index is valid
        if (index >= 0 && index < monthNames.length) {
            return monthNames[index];
        } else {
            throw new Error('Invalid month number');
        }
    }

    const navNext = () => {
        let month = parseInt(currentMonth.month);
        let year = parseInt(currentMonth.year);

        month++;
        if (month > 12) {
            month = 1;
            year++;
        }

        const newMonth = month.toString().padStart(2, '0');
        const newYear = year.toString();

        // Get current date
        const currentDate = new Date();
        const todayMonth = currentDate.getMonth() + 1; // Months are 0-indexed
        const todayYear = currentDate.getFullYear();

        // Disable the next button if newMonth and newYear are equal or greater than current month and year
        if (year > todayYear || (year === todayYear && month >= todayMonth)) { setDisableNextButton(true); }
        else { setDisableNextButton(false); }

        if (month <= 1 || year < todayYear) { setDisablePrevButton(true); }
        else { setDisablePrevButton(false); }

        dispatch(setCurrentMonth({ month: newMonth, year: newYear }));
    }

    const navPrev = () => {
        let month = parseInt(currentMonth.month);
        let year = parseInt(currentMonth.year);

        month--;
        if (month < 1) {
            month = 12;
            year--;
        }

        const newMonth = month.toString().padStart(2, '0');
        const newYear = year.toString();

        // Get current date
        const currentDate = new Date();
        const todayMonth = currentDate.getMonth() + 1; // Months are 0-indexed
        const todayYear = currentDate.getFullYear();

        // Disable the previous button if month reaches 1 and year is the current year
        if (month === 1 && year === todayYear) { setDisablePrevButton(true); }
        else { setDisablePrevButton(false); }

        // Enable the next button if the current year is smaller than the new date's year
        // and the month is smaller than the new date's month
        if (year < todayYear || (year === todayYear && month < todayMonth)) { setDisableNextButton(false); }
        else { setDisableNextButton(true); }

        dispatch(setCurrentMonth({ month: newMonth, year: newYear }));
    }

    const onTabValueChange = (value: string) => {
        const tab = value as MediaTabEnum;
        setMediaTab(tab)
    }

    return (
        <>
            <View style={styles.mediaTabParent}>
                <SegmentedButtons
                    value={mediaTab}
                    onValueChange={onTabValueChange}
                    buttons={[
                        { value: MediaTabEnum.MEAL, label: 'Meal', icon: 'food' },
                        { value: MediaTabEnum.WEIGHT, label: 'Weight', icon: 'weight' }
                    ]}
                />
            </View>

            <View style={styles.calendarParent}>
                <Button icon={() => (<Avatar.Icon size={30} icon="chevron-left" color='#fff' style={[{ backgroundColor: disablePrevButton ? '#B0B0B0' : 'tomato' }]} />)} mode="text" onPress={navPrev} disabled={disablePrevButton}>{''}</Button>
                <Text variant="titleLarge">{getMonthName(currentMonth.month)} {currentMonth.year}</Text>
                <Button icon={() => (<Avatar.Icon size={30} icon="chevron-right" color='#fff' style={[{ backgroundColor: disableNextButton ? '#B0B0B0' : 'tomato' }]} />)} mode="text" onPress={navNext} disabled={disableNextButton}>{''}</Button>
            </View>

            {mediaTab === MediaTabEnum.MEAL && <AppMediaMealComponent />}
            {mediaTab === MediaTabEnum.WEIGHT && <AppMediaWeightComponent />}
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
    }
})