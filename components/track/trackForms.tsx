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
    setDialogStatus: (status: boolean) => void;
}

export default function TrackForms({ currentDate, userId, formTab, setDialogStatus }: TrackFormsProps) {
    return (
        <View>
            {formTab === "sleep" && (
                <TrackSleepForm currentDate={currentDate} userId={userId} setDialogStatus={() => setDialogStatus(false)}></TrackSleepForm>
            )}
            {formTab === "diet" && (
                <TrackDietForm currentDate={currentDate} userId={userId} setDialogStatus={() => setDialogStatus(false)}></TrackDietForm>
            )}
            {formTab === "water" && (
                <TrackWaterForm currentDate={currentDate} userId={userId} setDialogStatus={() => setDialogStatus(false)}></TrackWaterForm>
            )}
            {formTab === "weight" && (
                <TrackWeightForm currentDate={currentDate} userId={userId} setDialogStatus={() => setDialogStatus(false)}></TrackWeightForm>
            )}
        </View>
    )
}