import React from "react";
import { View } from "react-native";
import TrackSleepForm from "./trackSleepForm";
import TrackWaterForm from "./trackWaterForm";
import TrackDietForm from "./trackDietForm";
import TrackWeightForm from "./trackWeightForm";

interface TrackFormsProps {
    formTab: string;
}

export default function TrackForms({ formTab }: TrackFormsProps) {
    return (
        <View>
            {formTab === "sleep" && ( <TrackSleepForm></TrackSleepForm> )}
            {formTab === "diet" && ( <TrackDietForm></TrackDietForm> )}
            {formTab === "water" && ( <TrackWaterForm></TrackWaterForm> )}
            {formTab === "weight" && ( <TrackWeightForm></TrackWeightForm> )}
        </View>
    )
}