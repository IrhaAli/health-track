import React from "react";
import { View } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import TrackSleepForm from "./trackSleepForm";
import TrackWaterForm from "./trackWaterForm";
import TrackDietForm from "./trackDietForm"; 
import TrackWeightForm from "./trackWeightForm";
import { DialogTab } from "@/store/trackDialogSlice";

const FORM_COMPONENTS: Record<DialogTab, React.ComponentType> = {
    [DialogTab.SLEEP]: TrackSleepForm,
    [DialogTab.DIET]: TrackDietForm,
    [DialogTab.WATER]: TrackWaterForm,
    [DialogTab.WEIGHT]: TrackWeightForm
};

export default function TrackForms() {
    const dialogTab = useSelector((state: RootState) => state.trackDialog.dialogTab);
    const FormComponent = dialogTab ? FORM_COMPONENTS[dialogTab as DialogTab] : null;
    
    return (
        <View>
            {FormComponent && <FormComponent />}
        </View>
    );
}