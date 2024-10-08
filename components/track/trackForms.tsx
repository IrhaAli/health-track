import React from "react";
import { View } from "react-native";
import TrackSleepForm from "./trackSleepForm";
import TrackWaterForm from "./trackWaterForm";
import TrackDietForm from "./trackDietForm";
import TrackWeightForm from "./trackWeightForm";

interface TrackFormsProps {
    currentDate: string;
    userId: string;
    formTab: string;
}

export default function TrackForms({ currentDate, userId, formTab }: TrackFormsProps) {
    return (
        <View>
            {formTab === "sleep" && (
                <TrackSleepForm currentDate={currentDate} userId={userId}></TrackSleepForm>
            )}
            {formTab === "diet" && (
                <TrackDietForm currentDate={currentDate} userId={userId}></TrackDietForm>
            )}
            {formTab === "water" && (
                <TrackWaterForm currentDate={currentDate} userId={userId}></TrackWaterForm>
            )}
            {formTab === "weight" && (
                <TrackWeightForm currentDate={currentDate} userId={userId}></TrackWeightForm>
            )}
        </View>
    )
}