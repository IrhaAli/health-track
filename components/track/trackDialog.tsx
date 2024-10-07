import React, { useState } from "react";
import { StyleSheet, View, Button } from "react-native";
import Dialog from "react-native-dialog";
import TrackForms from "./trackForms";

interface TrackDialogProps {
    currentDate: string;
    userId: string;
    visible: boolean;
    hideDialog: () => void;
}

export default function TrackDialog({ currentDate, userId, visible, hideDialog }: TrackDialogProps) {
    const [formTab, setFormTab] = useState("sleep");

    return (
        <View>
            <Dialog.Container visible={visible}>
                <Dialog.Title>{`Add ${new Date(currentDate).toLocaleString("default", { month: "short", })}, ${new Date(currentDate).getDate()} 's Data`}</Dialog.Title>
                <View style={styles.formTabs}>
                    <Button onPress={() => setFormTab("sleep")} title="Sleep" />
                    <Button onPress={() => setFormTab("diet")} title="Diet" />
                    <Button onPress={() => setFormTab("water")} title="Water" />
                    <Button onPress={() => setFormTab("weight")} title="Weight" />
                </View>
                <View style={styles.formTabsBody}>
                    <TrackForms currentDate={currentDate} userId={userId} formTab={formTab} hideDialog={hideDialog}></TrackForms>
                </View>
            </Dialog.Container>
        </View>
    );
}

const styles = StyleSheet.create({
    trackDialog: {
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 30
    },
    formTabs: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    formTabsBody: {
        backgroundColor: "#808080",
    },
})