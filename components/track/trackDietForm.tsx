import React, { useState } from "react";
import { View, StyleSheet, Platform, Image } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { setHideCamera, setShowCamera, setImageURI } from "@/store/cameraSlice";
import { setDialog } from "@/store/trackDialogSlice";
import { AppDispatch, RootState } from "@/store/store";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { Divider, Button, Text, HelperText } from 'react-native-paper';
import { getAuth } from "firebase/auth";
import { addDietData } from "@/store/trackSlice";

export default function TrackDietForm() {
    const dispatch = useDispatch<AppDispatch>();
    const imageURI = useSelector((state: RootState) => state.camera.imageURI);
    const currentDate = useSelector((state: RootState) => state.track.currentDate);
    const storage = getStorage();
    const [mealTime, setMealTime] = useState<Date>(() => {
        const date = new Date(currentDate); // Initialize with the current date
        const now = new Date(); // Get the current time
      
        // Set the hours, minutes, and seconds to the current time
        date.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
      
        return date;
    });
    const [showMealTimeSelector, setShowMealTimeSelector] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [showError, setShowError] = useState<boolean>(false);
    const [errorString, setErrorString] = useState<string | null>(null);
    const auth = getAuth();

    const onMealTimeChange = (event: DateTimePickerEvent, date?: Date): void => {
        if (event.type === "dismissed" || event.type === "set") { setShowMealTimeSelector(false); }
        if (date) { 
            setMealTime(prev => {
                const newDateTime = new Date(prev || date);
                newDateTime.setHours(date.getHours(), date.getMinutes());
                return newDateTime;
            });
        }
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
        setShowError(false);
        setErrorString(null);

        if (auth?.currentUser?.uid) {
            if (!imageURI) { 
                setShowError(true);
                setErrorString('Please add your picture.');
                return;
             }
            setLoading(true);
    
            try {
                
                // await addDoc(collection(db, "diet_tracking"), { user_id: auth?.currentUser?.uid, date: mealTime, meal_picture: await uploadImage() });
                let addDiet = { user_id: auth.currentUser.uid, date: mealTime, meal_picture: await uploadImage() }
                dispatch(addDietData({currentDate: currentDate, addDiet: addDiet}));

                // Ressetting Fields.
                setMealTime(new Date(currentDate));
                setShowMealTimeSelector(false);
                dispatch(setHideCamera());
                dispatch(setImageURI(''));
                setLoading(false);
                // Ressetting Fields.
        
                dispatch(setDialog({ showDialog: false, dialogTab: null, dialogType: null }));
            } catch (error) { setLoading(false); }
        } else { router.push({ pathname: "/register" }); }
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

                {!imageURI ? (<Button icon="camera" mode="contained" style={[{marginTop: 5, marginBottom: 10}]} onPress={() => { dispatch(setDialog({ showDialog: false, dialogTab: null, dialogType: null })); dispatch(setShowCamera()); }} disabled={loading}>Add Weight Picture</Button>) : (
                    <>
                        <Button icon="delete" mode="text" onPress={() => { dispatch(setImageURI('')); }} disabled={loading}>{''}</Button>
                        <Image source={{ uri: imageURI }} width={100} height={200} resizeMode="contain" />
                    </>
                )}
            </View>

            <Divider />
            <View style={styles.formSubmission}>
                <Button mode="text" onPress={() => dispatch(setDialog({ showDialog: false, dialogTab: null, dialogType: null }))} disabled={loading} textColor="blue">Cancel</Button>
                <Button mode="contained" onPress={onSubmit} disabled={loading || !imageURI} loading={loading}>Submit</Button>
            </View>

            {showError && <HelperText type="error" visible={showError}>{errorString}</HelperText>}
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