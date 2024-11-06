import { ScrollView } from "react-native";
import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchDietData, fetchSleepData, fetchWaterData, fetchWeightData } from "@/store/trackSlice";
import { getAuth } from "firebase/auth";

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
    const auth = getAuth();
    const user = auth?.currentUser;
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        if (user?.uid && currentMonth.month && currentMonth.year) {
            dispatch(fetchWaterData({ month: String(currentMonth.month), year: String(currentMonth.year), userId: String(user.uid) }));
            dispatch(fetchSleepData({ month: String(currentMonth.month), year: String(currentMonth.year), userId: String(user.uid) }));
            dispatch(fetchWeightData({ month: String(currentMonth.month), year: String(currentMonth.year), userId: String(user.uid) }));
            dispatch(fetchDietData({ month: String(currentMonth.month), year: String(currentMonth.year), userId: String(user.uid) }));
        }
    }, [user, currentMonth, dispatch]);

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
