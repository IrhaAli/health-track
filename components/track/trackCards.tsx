import { ScrollView } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchDietData, fetchSleepData, fetchWaterData, fetchWeightData } from "@/store/trackSlice";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Local Components Start.
import TrackWaterCard from "./trackWaterCard";
import TrackSleepCard from "./trackSleepCard";
import TrackWeightCard from "./trackWeightCard";
import TrackDietCard from "./trackDietCard";
// Local Components End.

export default function TrackCards() {
    const currentMonth = useSelector((state: RootState) => state.track.currentMonth);
    const currentDate = useSelector((state: RootState) => state.track.currentDate);
    const dispatch = useDispatch<AppDispatch>();
    const [currentUser, setCurrentUser] = useState<any>(null);
    const scrollViewRef = useRef<ScrollView>(null);

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
        if (currentUser?.uid && currentMonth.month && currentMonth.year) {
            dispatch(fetchWaterData({ month: String(currentMonth.month), year: String(currentMonth.year), userId: String(currentUser.uid) }));
            dispatch(fetchSleepData({ month: String(currentMonth.month), year: String(currentMonth.year), userId: String(currentUser.uid) }));
            dispatch(fetchWeightData({ month: String(currentMonth.month), year: String(currentMonth.year), userId: String(currentUser.uid) }));
            dispatch(fetchDietData({ month: String(currentMonth.month), year: String(currentMonth.year), userId: String(currentUser.uid) }));
        }
    }, [currentUser, currentMonth, dispatch]);

    useEffect(() => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }, [currentDate, currentMonth]);

    return (
        <ScrollView ref={scrollViewRef}>
            <TrackWaterCard></TrackWaterCard>
            <TrackSleepCard></TrackSleepCard>
            <TrackWeightCard></TrackWeightCard>
            <TrackDietCard></TrackDietCard>
        </ScrollView>
    );
}
