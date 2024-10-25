import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, Platform, Image } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { setHideCamera, setShowCamera, setImageURI, clearImageURI } from "@/store/cameraSlice";
import { DialogType, setDialog } from "@/store/trackDialogSlice";
import { AppDispatch, RootState } from "@/store/store";
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { Divider, Button, Text, HelperText, Avatar } from 'react-native-paper';
import { getAuth } from "firebase/auth";
import { addDietData, updateDietData } from "@/store/trackSlice";
import { DietDataEntry, DietDataState, isDietDataEntry, TrackState } from "@/types/track";

export default function TrackDietForm() {
    const dispatch = useDispatch<AppDispatch>();
    const imageURI: string | null = useSelector((state: RootState) => state.camera.imageURI);
    const currentDate: string = useSelector((state: RootState) => state.track.currentDate);
    const dietData: DietDataState = useSelector((state: RootState) => state.track.dietData);

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
    const dialogType: DialogType | null = useSelector((state: RootState) => state.trackDialog.dialogType);
    const auth = getAuth();
    const [imageToBeDelete, setImageToBeDelete] = useState<string | null>(null);
    const [currentDietData, setCurrentDietData] = useState<DietDataEntry | {}>({});

    const getDietDataObject = (): DietDataEntry | {} => {
        const [year, month] = currentDate.split('-');
        const formattedMonth = `${year}-${month}`;

        if (!Array.isArray(dietData)) {
            if (formattedMonth in dietData) {
                if (dietData[formattedMonth] && dietData[formattedMonth].length > 0) {

                    const entry = dietData[formattedMonth].find((entry: DietDataEntry) => new Date(entry.date).toLocaleDateString().split('/').reverse().join('-') === currentDate);
                    if (entry) { return entry; }
                }
            }
        }
        return {}; // Return an empty object if conditions are not met
    }

    useEffect(() => {
        if (dialogType === DialogType.EDIT) {
            const entry: DietDataEntry | {} = getDietDataObject();
            if (entry && isDietDataEntry(entry)) {
                setCurrentDietData(entry);
                setMealTime(prev => {
                    const newDateTime = new Date(prev || entry.date);
                    newDateTime.setHours(new Date(entry.date).getHours(), new Date(entry.date).getMinutes());
                    return newDateTime;
                });
            }
        }
    }, [dialogType, currentDate, dietData]); // Dependencies to re-run the effect

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

    const deleteImage = async () => {
        if (isDietDataEntry(currentDietData) && currentDietData.meal_picture) {
            setImageToBeDelete(currentDietData.meal_picture);
            setCurrentDietData({ ...currentDietData, meal_picture: null });
        }
        else { throw new Error(`Image not available for the current weight card!`); }
    };

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
        const [year, month] = currentDate.split('-');
        const formattedMonth = `${year}-${month}`;
        const weightDataForMonth = dietData?.[formattedMonth] || [];

        setShowError(false);
        setErrorString(null);

        const existingEntry = weightDataForMonth.find(
            entry => new Date(entry.date).toLocaleDateString().split('/').reverse().join('-') === currentDate
        );

        if (dialogType !== DialogType.EDIT && existingEntry) {
            setShowError(true);
            setErrorString('Water data already exists!');
            return;
        }

        if (dialogType === DialogType.EDIT && !existingEntry) {
            setShowError(true);
            setErrorString("Water data doesn't exists, add water first!");
            return;
        }

        if (auth?.currentUser?.uid) {
            if ((dialogType !== DialogType.EDIT) && !imageURI) {
                setShowError(true);
                setErrorString('Please add meal picture!');
                return;
            }

            if ((dialogType === DialogType.EDIT) && isDietDataEntry(currentDietData)) {
                if (!imageURI && !currentDietData.meal_picture) {
                    setShowError(true);
                    setErrorString('Please add meal picture!');
                    return;
                }
            }

            setLoading(true);

            try {
                if (dialogType !== DialogType.EDIT) {
                    let addDiet = { user_id: auth.currentUser.uid, date: mealTime, meal_picture: await uploadImage() }
                    dispatch(addDietData({ currentDate: currentDate, addDiet: addDiet }));
                }
                if (dialogType === DialogType.EDIT && isDietDataEntry(currentDietData)) {
                    if (imageToBeDelete) {
                        const match = imageToBeDelete.match(/diet%2F([^?]+)/);
                        if (match && match[1]) {
                            const id = match[1];
                            let dietImageRef = ref(storage, `diet/${id}`);
                            await deleteObject(dietImageRef);
                        } else { console.error("ID not found in the URL"); }
                    }

                    let updateDiet: DietDataEntry = { ...currentDietData, date: mealTime, meal_picture: imageURI ? await uploadImage() : currentDietData.meal_picture ? currentDietData.meal_picture : '' }
                    dispatch(updateDietData({ updateDiet, currentDate }));
                }

                // Ressetting Fields.
                setMealTime(new Date(currentDate));
                setShowMealTimeSelector(false);
                dispatch(setHideCamera());
                dispatch(setImageURI(''));
                setLoading(false);
                dispatch(clearImageURI());
                // Ressetting Fields.

                dispatch(setDialog({ showDialog: false, dialogTab: null, dialogType: null }));
            } catch (error) { console.log('error', error); setLoading(false); }
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

                {/* Original Code */}
                {/* {!imageURI ? (<Button icon="camera" mode="contained" style={[{ marginTop: 5, marginBottom: 10 }]} onPress={() => { dispatch(setShowCamera()); }} disabled={loading}>Add Meal Picture</Button>) : (
                    <>
                        <Button icon="delete" mode="text" onPress={() => { dispatch(setImageURI('')); }} disabled={loading}>{''}</Button>
                        <Image source={{ uri: imageURI }} width={100} height={200} resizeMode="contain" />
                    </>
                )} */}
                {/* Original Code */}

                {dialogType !== DialogType.EDIT && (!imageURI ? (<Button icon="camera" mode="contained" onPress={() => { dispatch(setShowCamera()); }} disabled={loading}>Add Weight Picture</Button>) : (
                    <View>
                        <Button icon={({ size, color }) => (<Avatar.Icon size={24} icon="delete" color="#fff" />)} mode="text" onPress={() => { dispatch(setImageURI('')); }} disabled={loading} style={[{ position: 'absolute', right: -15, zIndex: 999, top: 15 }]}>{''}</Button>
                        <Image source={{ uri: imageURI }} style={[{ borderWidth: 1, width: 100, height: 200, resizeMode: 'contain' }]} />
                    </View>
                ))}

                {dialogType === DialogType.EDIT && isDietDataEntry(currentDietData) && !imageURI && (!currentDietData.meal_picture || !currentDietData.meal_picture.length) && (<Button icon="camera" mode="contained" onPress={() => { dispatch(setShowCamera()); }} disabled={loading}>Add Meal Picture</Button>)}

                {dialogType === DialogType.EDIT && isDietDataEntry(currentDietData) && imageURI && (!currentDietData.meal_picture || !currentDietData.meal_picture.length) && (
                    <View>
                        <Button icon={({ size, color }) => (<Avatar.Icon size={24} icon="delete" color="#fff" />)} mode="text" onPress={() => { dispatch(setImageURI('')); }} disabled={loading} style={[{ position: 'absolute', right: -15, zIndex: 999, top: 15 }]}>{''}</Button>
                        <Image source={{ uri: imageURI }} style={[{ borderWidth: 1, width: 100, height: 200, resizeMode: 'contain' }]} />
                    </View>
                )}

                {dialogType === DialogType.EDIT && isDietDataEntry(currentDietData) && currentDietData.meal_picture && currentDietData.meal_picture.length && (
                    <View>
                        <Button icon={({ size, color }) => (<Avatar.Icon size={24} icon="delete" color="#fff" />)} mode="text" onPress={() => { deleteImage(); }} disabled={loading} style={[{ position: 'absolute', right: -15, zIndex: 999, top: 15 }]}>{''}</Button>
                        <Image source={{ uri: currentDietData.meal_picture }} style={[{ borderWidth: 1, width: 100, height: 200, resizeMode: 'contain' }]} />
                    </View>
                )}
            </View>

            <Divider />
            <View style={styles.formSubmission}>
                <Button mode="text" onPress={() => { dispatch(setDialog({ showDialog: false, dialogTab: null, dialogType: null })); dispatch(clearImageURI()); }} disabled={loading} textColor="blue">Cancel</Button>
                <Button mode="contained" onPress={onSubmit} disabled={loading || (!imageURI && isDietDataEntry(currentDietData) && !currentDietData.meal_picture)} loading={loading}>Submit</Button>
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