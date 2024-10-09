import React, { useState } from "react";
import { Pressable, View, StyleSheet, Platform, Image, Alert, ActivityIndicator } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { setHideCamera, setShowCamera, setImageURI } from "@/store/cameraSlice";
import { setHideDialog } from "@/store/trackDialogSlice";
import { RootState } from "@/store/store";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { Divider, Button, Text } from 'react-native-paper';

export default function TrackDietForm() {
    const dispatch = useDispatch();
    const imageURI = useSelector((state: RootState) => state.camera.imageURI);
    const currentDate = useSelector((state: RootState) => state.track.currentDate);
    const userId = useSelector((state: RootState) => state.user.userId);
    const storage = getStorage();
    const [mealTime, setMealTime] = useState(new Date(currentDate));
    const [showMealTimeSelector, setShowMealTimeSelector] = useState(false);
    const [loading, setLoading] = useState(false);

    const onMealTimeChange = (event: DateTimePickerEvent, date?: Date): void => {
        if (event.type === "dismissed" || event.type === "set") { setShowMealTimeSelector(false); }
        if (date) { setMealTime(date); }
    }

    const uploadImage = async () => {
        if (!imageURI) { throw new Error(`Invalid URI for Diet`); }

        const response = await fetch(imageURI);

        const blob = await response.blob();
        let refer = ref(storage, `diet/${new Date().getTime()}`);
        return uploadBytes(refer, blob)
            .then((snapshot) => { return getDownloadURL(snapshot.ref); })
            .then((downloadUrl) => { return downloadUrl; });
    };

    const onSubmit = async () => {
        if (!userId) { router.push({ pathname: "/(signup)" }); }

        if (!imageURI) { Alert.alert("Please add a picture of your meal."); return; }
        setLoading(true);
        await addDoc(collection(db, "diet_tracking"), { user_id: userId, date: mealTime, meal_picture: await uploadImage() });

        // Ressetting Fields.
        setMealTime(new Date(currentDate));
        setShowMealTimeSelector(false);
        dispatch(setHideCamera());
        dispatch(setImageURI(''));
        setLoading(false);
        // Ressetting Fields.

        dispatch(setHideDialog());
    }

    return (
        <View style={styles.trackDietForm}>
            <View style={styles.buttonContainer}>

                <Text variant="titleLarge">Time of Meal</Text>
                {Platform.OS == "android" ?
                    <View>
                        <Button mode="text" icon="clock" onPress={() => { setShowMealTimeSelector(true); }} disabled={loading} loading={loading} textColor="blue">
                            {`${mealTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}`}
                        </Button>
                        {showMealTimeSelector && <DateTimePicker mode="time" value={mealTime} onChange={onMealTimeChange} />}
                    </View> :
                    <View>
                        <DateTimePicker mode="time" value={mealTime} onChange={onMealTimeChange} />
                    </View>
                }

                {!imageURI ? (<Button icon="camera" mode="contained" style={[{marginTop: 5, marginBottom: 10}]} onPress={() => { dispatch(setHideDialog()); dispatch(setShowCamera()); }} disabled={loading}>Add Weight Picture</Button>) : (
                    <>
                        <Button icon="delete" mode="text" onPress={() => { dispatch(setImageURI('')); }} disabled={loading}>{''}</Button>
                        <Image source={{ uri: imageURI }} width={100} height={200} resizeMode="contain" />
                    </>
                )}
            </View>

            <Divider />
            <View style={styles.formSubmission}>
                <Button mode="text" onPress={() => dispatch(setHideDialog())} disabled={loading} textColor="blue">Cancel</Button>
                <Button mode="contained" onPress={onSubmit} disabled={loading} loading={loading}>Submit</Button>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    trackDietForm: {
        paddingVertical: 10,
        // backgroundColor: 'white'
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
    formSubmission: {
        flexDirection: 'row',
        // backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingTop: 15
    },
    cancelButton: {
        color: 'blue',
        textTransform: 'uppercase',
        fontSize: 16
    },
    submitButton: {
        flexDirection: 'row',
        backgroundColor: 'red',
        paddingVertical: 7,
        paddingHorizontal: 15,
        borderRadius: 3,
        marginLeft: 15,
        alignItems: 'center',
        justifyContent: 'center'
    },
    submitButtonText: {
        color: 'white',
        fontWeight: '700',
        textTransform: 'uppercase',
        marginRight: 5
    }
})