import React, { useState } from "react";
import { StyleSheet } from "react-native";
import TrackForms from "./trackForms";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { setHideDialog, setShowDialog } from "@/store/trackDialogSlice";
import AppCamera from "../camera";
import { SegmentedButtons } from 'react-native-paper';
import { Button, Dialog, Portal, Divider, Text } from 'react-native-paper';

export default function TrackDialog() {
    const [formTab, setFormTab] = useState("sleep");
    const dialogStatus = useSelector((state: RootState) => state.trackDialog.showDialog);
    const dispatch = useDispatch();
    const currentDate = useSelector((state: RootState) => state.track.currentDate);

    return (
        <>
            <Button mode="contained" uppercase onPress={() => dispatch(setShowDialog())}>Add</Button>

            <Portal>
                <Dialog visible={dialogStatus} dismissable={false} onDismiss={() => dispatch(setHideDialog())}>
                    <Dialog.Title>{`Add ${new Date(currentDate).toLocaleString("default", { month: "short", })}, ${new Date(currentDate).getDate()} 's `}<Text style={[{textTransform: 'capitalize'}]}>{formTab}</Text>{` Data`}</Dialog.Title>
                    <Dialog.Content>
                        <SegmentedButtons
                            value={formTab}
                            onValueChange={setFormTab}
                            buttons={[
                                { value: 'sleep', label: 'Sleep', icon: 'moon-waning-crescent' },
                                { value: 'diet', label: 'Diet', icon: 'food' },
                                { value: 'water', label: 'Water', icon: 'glass-pint-outline' },
                                { value: 'weight', label: 'Weight', icon: 'weight' },
                            ]}
                        />
                        <Divider style={[{marginVertical: 10}]}/>
                        <TrackForms formTab={formTab}></TrackForms>
                    </Dialog.Content>
                </Dialog>
            </Portal>
            
            <AppCamera></AppCamera>
        </>
    );
}

const styles = StyleSheet.create({
    trackDialog: {
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    formTabs: {
        display: "flex",
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%'
    },
    formTabsBody: {
        backgroundColor: "#808080",
    },
    buttonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
    button: {
        backgroundColor: "red",
        height: 45,
        borderColor: "gray",
        borderWidth: 1,
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
    },
    tabButton: {
        flex: 1,
        justifyContent: 'center',
        alignContent: 'center'
    },
    tabButtonText: {
        color: 'white',
        backgroundColor: 'red',
        paddingVertical: 10,
        paddingHorizontal: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        borderRadius: 0,
        fontSize: 15,
        textAlign: 'center'
    },
    dialogTitle: {
        color: 'black',
        textTransform: 'capitalize',
        fontWeight: '700'
    }
})