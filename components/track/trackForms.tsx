import React from "react";
import { View } from "react-native";
import TrackSleepForm from "./trackSleepForm";
import TrackWaterForm from "./trackWaterForm";
import TrackDietForm from "./trackDietForm";
import TrackWeightForm from "./trackWeightForm";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export default function TrackForms() {
    const dialogTab = useSelector((state: RootState) => state.trackDialog.dialogTab);

    return (
        <View>
            {dialogTab === "sleep" && ( <TrackSleepForm></TrackSleepForm> )}
            {dialogTab === "diet" && ( <TrackDietForm></TrackDietForm> )}
            {dialogTab === "water" && ( <TrackWaterForm></TrackWaterForm> )}
            {dialogTab === "weight" && ( <TrackWeightForm></TrackWeightForm> )}
        </View>
    )
}