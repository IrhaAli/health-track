import React, { useState } from "react";
import { StyleSheet } from "react-native";
import TrackForms from "./trackForms";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { setDialog, setTab } from "@/store/trackDialogSlice";
import AppCamera from "../camera";
import { SegmentedButtons } from 'react-native-paper';
import { Button, Dialog, Portal, Divider, Text } from 'react-native-paper';
import { clearImageURI } from "@/store/cameraSlice";

export default function TrackDialog() {
    const dialogStatus = useSelector((state: RootState) => state.trackDialog.showDialog);
    const dispatch = useDispatch<AppDispatch>();
    const currentDate = useSelector((state: RootState) => state.track.currentDate);
    const dialogTab = useSelector((state: RootState) => state.trackDialog.dialogTab);
    const dialogType = useSelector((state: RootState) => state.trackDialog.dialogType);

    return (
        <>
            <Button mode="contained" icon="book-plus" style={[{ alignSelf: 'flex-end', position: "absolute", bottom: 5, right: 5 }]} uppercase onPress={() => dispatch(setDialog({ showDialog: true, dialogTab: 'sleep', dialogType: 'ADD' }))}>Add Track</Button>

            <Portal>
                <Dialog visible={dialogStatus} dismissable={false} onDismiss={() => dispatch(setDialog({ showDialog: false, dialogTab: null, dialogType: null }))}>
                    <Dialog.Title>{`Add ${new Date(currentDate).toLocaleString("default", { month: "short", })}, ${new Date(currentDate).getDate()} 's `}<Text style={[{ textTransform: 'capitalize' }]}>{dialogTab}</Text>{` Data`}</Dialog.Title>
                    <Dialog.Content>
                        {dialogType !== 'EDIT' && <>
                            <SegmentedButtons
                                value={dialogTab ? dialogTab : 'sleep'}
                                onValueChange={(value: string) => { dispatch(setTab(value)); dispatch(clearImageURI()); }}
                                buttons={[
                                    { value: 'sleep', label: 'Sleep', icon: 'moon-waning-crescent' },
                                    { value: 'diet', label: 'Diet', icon: 'food' },
                                    { value: 'water', label: 'Water', icon: 'glass-pint-outline' },
                                    { value: 'weight', label: 'Weight', icon: 'weight' },
                                ]}
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