import React, { useState } from "react";
import { Pressable, View, Text, StyleSheet, Platform, Image } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { setHideCamera, setShowCamera, setImageURI } from "@/store/cameraSlice";
import { setHideDialog } from "@/store/trackDialogSlice";
import { RootState } from "@/store/store";

interface TrackFormsProps {
    currentDate: string;
    userId: string;
}

export default function TrackDietForm({ currentDate, userId }: TrackFormsProps) {
    const [mealTime, setMealTime] = useState(new Date(currentDate));
    const [showMealTimeSelector, setShowMealTimeSelector] = useState(false);
    const dispatch = useDispatch();
    const imageURI = useSelector((state: RootState) => state.camera.imageURI);


    const onMealTimeChange = (event: DateTimePickerEvent, date?: Date): void => {
        if (event.type === "dismissed" || event.type === "set") { setShowMealTimeSelector(false); }
        if (date) { setMealTime(date); }
    }

    const onSubmit = async () => {
        if (!userId) { router.push({ pathname: "/(signup)" }); }

        // await addDoc(collection(db, "sleep_tracking"), { user_id: userId, sleepDateTime, wakeupTime, sleepQuality, sleepDuration });

        // Ressetting Fields.
        setMealTime(new Date(currentDate));
        setShowMealTimeSelector(false);
        dispatch(setHideCamera());
        dispatch(setImageURI(''));
        // Ressetting Fields.

        dispatch(setHideDialog())
    }

    return (
        <View style={styles.trackDietForm}>
            <View style={styles.buttonContainer}>

                {(!imageURI || imageURI == '') ? (
                    <Pressable style={styles.imageButton} onPress={() => { dispatch(setShowCamera()); dispatch(setHideDialog()) }}>
                        <Text style={styles.buttonText}>Add Meal Picture</Text>
                    </Pressable>
                ) : (
                    <Pressable style={styles.imageButton} onPress={() => { dispatch(setImageURI('')); }} >
                        <Image source={{ uri: imageURI }} width={100} height={200} resizeMode="contain" />
                        <Text style={styles.imageButtonText}>X</Text>
                    </Pressable>
                )}

                <View style={styles.mealTimeView}>
                    <Text>Time of Meal</Text>
                    {Platform.OS == "android" ?
                        <View>
                            <Pressable onPress={() => { setShowMealTimeSelector(true); }} >
                                <Text style={styles.mealTimeText}> {` ${mealTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}`}</Text>
                            </Pressable>
                            {showMealTimeSelector && <DateTimePicker mode="time" value={mealTime} onChange={onMealTimeChange} />}
                        </View> :
                        <View>
                            <DateTimePicker mode="time" value={mealTime} onChange={onMealTimeChange} />
                        </View>
                    }
                </View>
            </View>

            <View style={styles.formSubmission}>
                <Pressable onPress={() => dispatch(setHideDialog())}>
                    <Text style={styles.cancelButton}>Cancel</Text>
                </Pressable>
                <Pressable onPress={onSubmit}>
                    <Text style={styles.submitButton}>Submit</Text>
                </Pressable>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    trackDietForm: {
        paddingVertical: 30,
        backgroundColor: 'white'
    },
    buttonContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "700",
        backgroundColor: 'red',
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 3
    },
    mealTimeText: {
        marginBottom: 10,
        color: 'blue'
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
    imageButton: {
        color: 'white',
        flexDirection: 'row',
        paddingBottom: 10
    },
    imageButtonText: {
        color: 'black',
        fontWeight: '700',
        fontSize: 18,
        marginLeft: -2
    },
    mealTimeView: {
        flexDirection: 'row'
    },
    formSubmission: {
        flexDirection: 'row',
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingVertical: 10
    },
    cancelButton: {
        color: 'blue',
        textTransform: 'uppercase',
        fontSize: 16
    },
    submitButton: {
        color: 'white',
        backgroundColor: 'red',
        paddingVertical: 7,
        paddingHorizontal: 10,
        borderRadius: 3,
        marginLeft: 15,
        fontWeight: '700',
        textTransform: 'uppercase'
    }
})