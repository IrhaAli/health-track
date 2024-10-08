import React, { useState } from "react";
import { Pressable, View, Text, StyleSheet, Platform, Image } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { useDispatch } from "react-redux";
import { setHideCamera, setShowCamera } from "@/store/cameraSlice";
import { setHideDialog } from "@/store/trackDialogSlice";

interface TrackFormsProps {
    currentDate: string;
    userId: string;
}

export default function TrackDietForm({ currentDate, userId }: TrackFormsProps) {
    const [mealTime, setMealTime] = useState(new Date(currentDate));
    const [showMealTimeSelector, setShowMealTimeSelector] = useState(false);
    const [imageUri, setImageUri] = useState(null);
    const dispatch = useDispatch();

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
        setImageUri(null);
        // Ressetting Fields.

        dispatch(setHideDialog())
    }

    return (
        <View style={styles.trackDietForm}>
            <View>
                <Pressable style={styles.button}
                    onPress={() => {
                        if (!imageUri) {
                            dispatch(setShowCamera());
                            dispatch(setHideDialog()) 
                        }
                        else { setImageUri(null); }
                    }}
                >
                    {!imageUri ? (
                        <Text style={styles.buttonText}>Add Meal Picture</Text>
                    ) : (
                        <>
                            <Image
                                source={{ uri: imageUri }}
                                width={100}
                                height={200}
                                resizeMode="contain"
                            />
                            <Text style={styles.buttonText}>X</Text>
                        </>
                    )}
                </Pressable>

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
    buttonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
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