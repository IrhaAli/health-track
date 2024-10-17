import React, { useState } from "react";
import { Pressable, View, StyleSheet, Platform, Image, Alert, ActivityIndicator } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { setHideCamera, setShowCamera, setImageURI } from "@/store/cameraSlice";
import { setHideDialog } from "@/store/trackDialogSlice";
import { AppDispatch, RootState } from "@/store/store";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { Divider, Button, Text } from 'react-native-paper';
import { getAuth } from "firebase/auth";

export default function TrackDietForm() {
    const dispatch = useDispatch<AppDispatch>();
    const imageURI = useSelector((state: RootState) => state.camera.imageURI);
    const currentDate = useSelector((state: RootState) => state.track.currentDate);
    const storage = getStorage();
    const [mealTime, setMealTime] = useState(() => {
        const date = new Date(currentDate); // Initialize with the current date
        const now = new Date(); // Get the current time
      
        // Set the hours, minutes, and seconds to the current time
        date.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
      
        return date;
    });
    const [showMealTimeSelector, setShowMealTimeSelector] = useState(false);
    const [loading, setLoading] = useState(false);
    const auth = getAuth();

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
        if (!auth?.currentUser?.uid) { router.push({ pathname: "/register" }); }
        if (!imageURI) { Alert.alert("Please add a picture of your meal."); return; }
        setLoading(true);

        try {
            await addDoc(collection(db, "diet_tracking"), { user_id: auth?.currentUser?.uid, date: mealTime, meal_picture: await uploadImage() });

            // Ressetting Fields.
            setMealTime(new Date(currentDate));
            setShowMealTimeSelector(false);
            dispatch(setHideCamera());
            dispatch(setImageURI(''));
            setLoading(false);
            // Ressetting Fields.
    
            dispatch(setHideDialog());
        }
        catch (error) {
            setLoading(false);
        }
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
                <Button mode="contained" onPress={onSubmit} disabled={loading || !imageURI} loading={loading}>Submit</Button>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    trackDietForm: {
        paddingVertical: 10,
    },
    buttonContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    },
    formSubmission: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingTop: 15
    },
})