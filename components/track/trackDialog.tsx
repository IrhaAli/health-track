import React, { useState } from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
import Dialog from "react-native-dialog";
import TrackForms from "./trackForms";
import AppCamera from "../camera";

interface TrackDialogProps {
    currentDate: string;
    userId: string;
}

export default function TrackDialog({ currentDate, userId }: TrackDialogProps) {
    const [formTab, setFormTab] = useState("sleep");
    const [dialogStatus, setDialogStatus] = useState(false);

    return (
        <View>
            <AppCamera setDialogStatus={(status) => setDialogStatus(status)}></AppCamera>
            
            <Pressable style={styles.button} onPress={() => setDialogStatus(true)}>
                <Text style={styles.buttonText}>Add</Text>
            </Pressable>

            <Dialog.Container visible={dialogStatus}>
                <Dialog.Title style={styles.dialogTitle}>{`Add ${new Date(currentDate).toLocaleString("default", { month: "short", })}, ${new Date(currentDate).getDate()} 's ${formTab} Data`}</Dialog.Title>
                <View style={styles.formTabs}>
                    <Pressable style={styles.tabButton} onPress={() => setFormTab("sleep")}><Text style={styles.tabButtonText}>Sleep</Text></Pressable>
                    <Pressable style={styles.tabButton} onPress={() => setFormTab("diet")}><Text style={styles.tabButtonText}>Diet</Text></Pressable>
                    <Pressable style={styles.tabButton} onPress={() => setFormTab("water")}><Text style={styles.tabButtonText}>Water</Text></Pressable>
                    <Pressable style={styles.tabButton} onPress={() => setFormTab("weight")}><Text style={styles.tabButtonText}>Weight</Text></Pressable>
                </View>
                <View style={styles.formTabsBody}>
                    <TrackForms currentDate={currentDate} userId={userId} formTab={formTab} setDialogStatus={(status: boolean) => setDialogStatus(status)}></TrackForms>
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