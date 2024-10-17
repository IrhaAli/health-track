import { ScrollView } from "react-native";
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchSleepData, fetchWaterData, fetchWeightData } from "@/store/trackSlice";
import { getAuth } from "firebase/auth";

// Local Components Start.
import TrackWaterCard from "./trackWaterCard";
import TrackSleepCard from "./trackSleepCard";
import TrackWeightCard from "./trackWeightCard";
// Local Components End.

export default function TrackCards() {
    const currentMonth = useSelector((state: RootState) => state.track.currentMonth);
    const dispatch = useDispatch<AppDispatch>();
    const auth = getAuth();

    const user = auth?.currentUser;

    useEffect(() => {
        if (user?.uid && currentMonth.month && currentMonth.year) {
            dispatch(fetchWaterData({ month: String(currentMonth.month), year: String(currentMonth.year), userId: String(user.uid) }));
            dispatch(fetchSleepData({ month: String(currentMonth.month), year: String(currentMonth.year), userId: String(user.uid) }));
            dispatch(fetchWeightData({ month: String(currentMonth.month), year: String(currentMonth.year), userId: String(user.uid) }));
        }
    }, [user, currentMonth, dispatch]);

    return (
        <ScrollView>
            <TrackWaterCard></TrackWaterCard>
            <TrackSleepCard></TrackSleepCard>
            <TrackWeightCard></TrackWeightCard>
        </ScrollView>
    );
}
