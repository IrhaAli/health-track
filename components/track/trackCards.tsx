import { ScrollView } from "react-native";
import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchDietData, fetchSleepData, fetchWaterData, fetchWeightData } from "@/store/trackSlice";
import AsyncStorage from '@react-native-async-storage/async-storage';

import TrackWaterCard from "./trackWaterCard";
import TrackSleepCard from "./trackSleepCard";
import TrackWeightCard from "./trackWeightCard";
import TrackDietCard from "./trackDietCard";

export default function TrackCards() {
    const { currentMonth, currentDate } = useSelector((state: RootState) => state.track);
    const dispatch = useDispatch<AppDispatch>();
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        (async () => {
            const userString = await AsyncStorage.getItem('session');
            if (!userString) return;

            const { uid } = JSON.parse(userString);
            const { month, year } = currentMonth;

            const params = {
                month: String(month),
                year: String(year), 
                userId: String(uid)
            };

            await Promise.all([
                dispatch(fetchWaterData(params)),
                dispatch(fetchSleepData(params)), 
                dispatch(fetchWeightData(params)),
                dispatch(fetchDietData(params))
            ]);
        })();
    }, [currentMonth, dispatch]);

    useEffect(() => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }, [currentDate, currentMonth]);

    return (
        <ScrollView ref={scrollViewRef}>
            <TrackWaterCard />
            <TrackSleepCard />
            <TrackWeightCard />
            <TrackDietCard />
        </ScrollView>
    );
}
