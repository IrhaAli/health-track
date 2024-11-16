import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Button, Dialog, Portal, Divider, Text, SegmentedButtons } from 'react-native-paper';
import { AppDispatch, RootState } from "@/store/store";
import { setDialog, setTab, DialogTab, DialogType } from "@/store/trackDialogSlice";
import { clearImageURI } from "@/store/cameraSlice";
import { DietDataEntry, SleepDataEntry, WaterDataEntry, WeightDataEntry, isDietDataEntry, isSleepDataEntry, isWaterDataEntry, isWeightDataEntry } from "@/types/track";
import TrackForms from "./trackForms";
import AppCamera from "../camera";
import i18n from "@/services/i18n";

export default function TrackDialog() {
    const dispatch = useDispatch<AppDispatch>();
    const { currentDate, waterData, weightData, sleepData, dietData } = useSelector((state: RootState) => state.track);
    const { showDialog: dialogStatus, dialogTab, dialogType } = useSelector((state: RootState) => state.trackDialog);
    const [currentData, setCurrentData] = useState({
        water: {} as WaterDataEntry | {},
        weight: {} as WeightDataEntry | {},
        sleep: {} as SleepDataEntry | {},
        diet: {} as DietDataEntry | {}
    });

    const convertToLocalDate = (date: string | Date): string => {
        const d = new Date(date);
        return new Date(d.getTime() - (d.getTimezoneOffset() * 60000))
            .toISOString()
            .split('T')[0];
    }

    const getDataForMonth = (data: any, dateField = 'date') => {
        const [year, month] = currentDate.split('-');
        const formattedMonth = `${year}-${month}`;

        if (!Array.isArray(data) && formattedMonth in data) {
            const monthData = data[formattedMonth];
            if (monthData?.length > 0) {
                return monthData.find((entry: any) => 
                    convertToLocalDate(entry[dateField]) === currentDate
                ) || {};
            }
        }
        return {};
    };

    const tabButtons = [
        { value: DialogTab.SLEEP, label: i18n.t('trackDialog.sleep'), icon: 'moon-waning-crescent', condition: !isSleepDataEntry(currentData.sleep) },
        { value: DialogTab.WATER, label: i18n.t('trackDialog.water'), icon: 'glass-pint-outline', condition: !isWaterDataEntry(currentData.water) },
        { value: DialogTab.WEIGHT, label: i18n.t('trackDialog.weight'), icon: 'weight', condition: !isWeightDataEntry(currentData.weight) },
        { value: DialogTab.DIET, label: i18n.t('trackDialog.diet'), icon: 'food', condition: true }
    ];

    const filteredButtons = tabButtons.filter(button => button.condition);

    useEffect(() => {
        if (dialogType !== DialogType.EDIT) {
            const newData = {
                water: getDataForMonth(waterData),
                weight: getDataForMonth(weightData),
                sleep: getDataForMonth(sleepData, 'wakeup_time'),
                diet: getDataForMonth(dietData)
            };
            setCurrentData(newData);

            if (filteredButtons.length > 0) {
                dispatch(setTab(filteredButtons[0].value));
            }
        }
    }, [currentDate, waterData, weightData, sleepData, dietData]);

    return (
        <>
            <Button 
                mode="contained" 
                icon="book-plus" 
                style={styles.addButton}
                onPress={() => {
                    const initialTab = filteredButtons.length > 0 ? filteredButtons[0].value : DialogTab.DIET;
                    dispatch(setDialog({ showDialog: true, dialogTab: initialTab, dialogType: DialogType.ADD }));
                }}
            >
                {i18n.t(filteredButtons.length > 1 ? 'trackDialog.addTrack' : 'trackDialog.addMeal')}
            </Button>

            <Portal>
                <Dialog visible={dialogStatus} dismissable={false} onDismiss={() => dispatch(setDialog({ showDialog: false, dialogTab: null, dialogType: null }))}>
                    <Dialog.Title>
                        {`${i18n.t(dialogType === DialogType.EDIT ? 'trackDialog.edit' : 'trackDialog.add')} ${new Date(currentDate).toLocaleDateString(i18n.locale, { month: 'short', day: 'numeric', timeZone: 'UTC' })} ${i18n.t('trackDialog.details')}`}
                    </Dialog.Title>
                    <Dialog.Content>
                        {dialogType !== DialogType.EDIT && filteredButtons.length > 1 && (
                            <>
                                <SegmentedButtons
                                    value={dialogTab || filteredButtons[0].value}
                                    onValueChange={(value) => {
                                        dispatch(setTab(value as DialogTab));
                                        dispatch(clearImageURI());
                                    }}
                                    buttons={filteredButtons}
                                />
                                <Divider style={styles.divider} />
                            </>
                        )}
                        <TrackForms />
                    </Dialog.Content>
                </Dialog>
            </Portal>

            <AppCamera />
        </>
    );
}

const styles = StyleSheet.create({
    addButton: {
        alignSelf: 'flex-end',
        position: "absolute",
        bottom: 5,
        right: 5
    },
    capitalize: {
        textTransform: 'capitalize'
    },
    divider: {
        marginTop: 10
    }
});