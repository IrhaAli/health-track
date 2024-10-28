import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import TrackForms from "./trackForms";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { setDialog, setTab, DialogTab, DialogType } from "@/store/trackDialogSlice";
import AppCamera from "../camera";
import { SegmentedButtons } from 'react-native-paper';
import { Button, Dialog, Portal, Divider, Text } from 'react-native-paper';
import { clearImageURI } from "@/store/cameraSlice";
import { DietDataEntry, DietDataState, SleepDataEntry, SleepDataState, WaterDataEntry, WaterDataState, WeightDataEntry, WeightDataState, isDietDataEntry, isSleepDataEntry, isWaterDataEntry, isWeightDataEntry } from "@/types/track";

export default function TrackDialog() {
    const dialogStatus = useSelector((state: RootState) => state.trackDialog.showDialog);
    const dispatch = useDispatch<AppDispatch>();
    const currentDate = useSelector((state: RootState) => state.track.currentDate);
    const dialogTab: DialogTab | null = useSelector((state: RootState) => state.trackDialog.dialogTab);
    const dialogType: DialogType | null = useSelector((state: RootState) => state.trackDialog.dialogType);
    const waterData: WaterDataState | [] = useSelector((state: RootState) => state.track.waterData);
    const weightData: WeightDataState | [] = useSelector((state: RootState) => state.track.weightData);
    const sleepData: SleepDataState | [] = useSelector((state: RootState) => state.track.sleepData);
    const dietData: DietDataState | [] = useSelector((state: RootState) => state.track.dietData);
    const [currentWaterData, setCurrentWaterData] = useState<WaterDataEntry | {}>({});
    const [currentWeightData, setCurrentWeightData] = useState<WeightDataEntry | {}>({});
    const [currentSleepData, setCurrentSleepData] = useState<SleepDataEntry | {}>({});
    const [currentDietData, setCurrentDietData] = useState<DietDataEntry | {}>({});


    const onTabValueChange = (value: string) => {
        const tab = value as DialogTab;
        dispatch(setTab(tab));
        dispatch(clearImageURI());
    }

    const getWaterDataObject = (): WaterDataEntry | {} => {
        const [year, month] = currentDate.split('-');
        const formattedMonth = `${year}-${month}`;

        if (!Array.isArray(waterData)) {
            if (formattedMonth in waterData) {
                if (waterData[formattedMonth] && waterData[formattedMonth].length > 0) {
                    const entry = waterData[formattedMonth].find((entry: WaterDataEntry) => new Date(entry.date).toLocaleDateString().split('/').reverse().join('-') === currentDate);
                    if (entry) { return entry; }
                }
            }
        }
        return {}; // Return an empty object if conditions are not met
    };

    const getWeightDataObject = (): WeightDataEntry | {} => {
        const [year, month] = currentDate.split('-');
        const formattedMonth = `${year}-${month}`;

        if (!Array.isArray(weightData)) {
            if (formattedMonth in weightData) {
                if (weightData[formattedMonth] && weightData[formattedMonth].length > 0) {
                    const entry = weightData[formattedMonth].find((entry: WeightDataEntry) => new Date(entry.date).toLocaleDateString().split('/').reverse().join('-') === currentDate);
                    if (entry) { return entry; }
                }
            }
        }
        return {}; // Return an empty object if conditions are not met
    };

    const getSleepDataObject = (): SleepDataEntry | {} => {
        const [year, month] = currentDate.split('-');
        const formattedMonth = `${year}-${month}`;

        if (!Array.isArray(sleepData)) {
            if (formattedMonth in sleepData) {
                if (sleepData[formattedMonth] && sleepData[formattedMonth].length > 0) {
                    const entry = sleepData[formattedMonth].find((entry: SleepDataEntry) => new Date(entry.wakeup_time).toLocaleDateString().split('/').reverse().join('-') === currentDate);
                    if (entry) { return entry; }
                }
            }
        }
        return {}; // Return an empty object if conditions are not met
    };

    const getDietDataObject = (): DietDataEntry | {} => {
        const [year, month] = currentDate.split('-');
        const formattedMonth = `${year}-${month}`;

        if (!Array.isArray(dietData)) {
            if (formattedMonth in dietData) {
                if (dietData[formattedMonth] && dietData[formattedMonth].length > 0) {
                    const entry = dietData[formattedMonth].find((entry: DietDataEntry) => new Date(entry.date).toLocaleDateString().split('/').reverse().join('-') === currentDate);
                    if (entry) { return entry; }
                }
            }
        }
        return {}; // Return an empty object if conditions are not met
    };

    const tabButtons = [
        { value: DialogTab.SLEEP, label: 'Sleep', icon: 'moon-waning-crescent', condition: !isSleepDataEntry(currentSleepData) },
        { value: DialogTab.WATER, label: 'Water', icon: 'glass-pint-outline', condition: !isWaterDataEntry(currentWaterData) },
        { value: DialogTab.WEIGHT, label: 'Weight', icon: 'weight', condition: !isWeightDataEntry(currentWeightData) }, 
        { value: DialogTab.DIET, label: 'Diet', icon: 'food', condition: true }, // Always show
    ];

    const filteredButtons = tabButtons.filter(button => button.condition);

    useEffect(() => {
        if (dialogType !== DialogType.EDIT) {
            const waterEntry: WaterDataEntry | {} = getWaterDataObject();
            if (waterEntry) { setCurrentWaterData(waterEntry); }
    
            const weightEntry: WeightDataEntry | {} = getWeightDataObject();
            if (weightEntry) { setCurrentWeightData(weightEntry); }
    
            const sleepEntry: SleepDataEntry | {} = getSleepDataObject();
            if (sleepEntry) { setCurrentSleepData(sleepEntry); }
    
            const dietEntry: DietDataEntry | {} = getDietDataObject();
            if (dietEntry) { setCurrentDietData(dietEntry); }
    
            if (isWaterDataEntry(waterEntry) && isWeightDataEntry(weightEntry) && isSleepDataEntry(sleepEntry)) { dispatch(setTab(DialogTab.DIET)); } 
            else if (!isWaterDataEntry(waterEntry) && !isWeightDataEntry(weightEntry) && !isSleepDataEntry(sleepEntry)) { return; }
            else if (dialogTab === DialogTab.WATER && !isWaterDataEntry(waterData)) { return;}
            else if (dialogTab === DialogTab.WEIGHT && !isWeightDataEntry(weightData)) { return;}
            else if (dialogTab === DialogTab.SLEEP && !isSleepDataEntry(sleepData)) { return;} 
            else if (dialogTab === DialogTab.DIET) { return;}
            else if (!isSleepDataEntry(sleepEntry)) { dispatch(setTab(DialogTab.SLEEP)); } 
            else if (!isWaterDataEntry(waterEntry)) { dispatch(setTab(DialogTab.WATER)); } 
            else if (!isWeightDataEntry(weightEntry)) { dispatch(setTab(DialogTab.WEIGHT)); } 
            else { dispatch(setTab(DialogTab.DIET)); }
        }
    }, [currentDate, waterData, weightData, sleepData, dietData, dialogTab]); // Dependencies to re-run the effect

    

    return (
        <>
            <Button mode="contained" icon="book-plus" style={[{ alignSelf: 'flex-end', position: "absolute", bottom: 5, right: 5 }]} uppercase onPress={() => dispatch(setDialog({ showDialog: true, dialogTab: DialogTab.SLEEP, dialogType: DialogType.ADD }))}>Add {filteredButtons.length > 1 ? 'Track' : 'Meal'}</Button>

            <Portal>
                <Dialog visible={dialogStatus} dismissable={false} onDismiss={() => dispatch(setDialog({ showDialog: false, dialogTab: null, dialogType: null }))}>
                    <Dialog.Title>{`${dialogType === DialogType.EDIT ? 'Edit' : 'Add'} ${new Date(currentDate).toLocaleString("default", { month: "short", })}, ${new Date(currentDate).getDate()} 's `}<Text style={[{ textTransform: 'capitalize' }]}>{dialogTab}</Text>{` Details`}</Dialog.Title>
                    <Dialog.Content>
                        {dialogType !== DialogType.EDIT && filteredButtons.length > 1 && <>
                            <SegmentedButtons
                                value={dialogTab ? dialogTab : DialogTab.SLEEP}
                                onValueChange={onTabValueChange}
                                buttons={filteredButtons}
                            />
                            <Divider style={[{ marginTop: 10 }]} />
                        </>}
                        <TrackForms></TrackForms>
                    </Dialog.Content>
                </Dialog>
            </Portal>

            <AppCamera></AppCamera>
        </>
    );
}

const styles = StyleSheet.create({
    tabButton: {
        flex: 1,
        justifyContent: 'center',
        alignContent: 'center'
    },
})