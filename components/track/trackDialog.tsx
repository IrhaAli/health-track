import React, { useState } from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
import Dialog from "react-native-dialog";
import TrackForms from "./trackForms";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { setShowDialog } from "@/store/trackDialogSlice";
import { setImageURI } from "@/store/cameraSlice";

export default function TrackDialog() {
    const [formTab, setFormTab] = useState("sleep");
    const dialogStatus = useSelector((state: RootState) => state.trackDialog.showDialog);
    const dispatch = useDispatch();
    const currentDate = useSelector((state: RootState) => state.track.currentDate);

    return (
        <View>
            <Pressable style={styles.button} onPress={() => dispatch(setShowDialog())}>
                <Text style={styles.buttonText}>Add</Text>
            </Pressable>

            <Dialog.Container visible={dialogStatus}>
                <Dialog.Title style={styles.dialogTitle}>{`Add ${new Date(currentDate).toLocaleString("default", { month: "short", })}, ${new Date(currentDate).getDate()} 's ${formTab} Data`}</Dialog.Title>
                <View style={styles.formTabs}>
                    <Pressable style={styles.tabButton} onPress={() => setFormTab("sleep")}><Text style={styles.tabButtonText}>Sleep</Text></Pressable>
                    <Pressable style={styles.tabButton} onPress={() => { setFormTab("diet"); dispatch(setImageURI('')); }}><Text style={styles.tabButtonText}>Diet</Text></Pressable>
                    <Pressable style={styles.tabButton} onPress={() => setFormTab("water")}><Text style={styles.tabButtonText}>Water</Text></Pressable>
                    <Pressable style={styles.tabButton} onPress={() => { setFormTab("weight"); dispatch(setImageURI('')); }}><Text style={styles.tabButtonText}>Weight</Text></Pressable>
                </View>
                <View style={styles.formTabsBody}>
                    <TrackForms formTab={formTab}></TrackForms>
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