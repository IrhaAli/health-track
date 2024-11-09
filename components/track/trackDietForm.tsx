import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, Platform, Image } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { setHideCamera, setShowCamera, setImageURI, clearImageURI } from "@/store/cameraSlice";
import { DialogType, setDialog } from "@/store/trackDialogSlice";
import { AppDispatch, RootState } from "@/store/store";
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { Divider, Button, Text, HelperText, Avatar, Surface } from 'react-native-paper';
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
        // Create date object in local timezone using currentDate
        const localDate = new Date(currentDate + 'T00:00:00');
        const now = new Date();
        
        // Set time components while preserving the date
        localDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
        
        return localDate;
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
                    // Create date object in local timezone
                    const localDate = new Date(currentDate + 'T00:00:00');
                    const entryDate = new Date(entry.date);
                    
                    // Set time while preserving the date
                    localDate.setHours(entryDate.getHours(), entryDate.getMinutes());
                    return localDate;
                });
            }
        }
    }, [dialogType, currentDate, dietData]); // Dependencies to re-run the effect

    const onMealTimeChange = (event: DateTimePickerEvent, date?: Date): void => {
        if (event.type === "dismissed" || event.type === "set") { setShowMealTimeSelector(false); }
        if (date) {
            setMealTime(prev => {
                // Create new date object in local timezone
                const localDate = new Date(currentDate + 'T00:00:00');
                
                // Set time while preserving the date
                localDate.setHours(date.getHours(), date.getMinutes());
                return localDate;
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
                const resetDate = new Date(currentDate + 'T00:00:00');
                const now = new Date();
                resetDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
                setMealTime(resetDate);
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
            <Surface style={styles.formContainer} elevation={3}>
                <View style={styles.timeSection}>
                    <Text variant="titleLarge" style={styles.sectionTitle}>Time of Meal</Text>
                    {Platform.OS == "android" ? (
                        <View style={styles.timePickerContainer}>
                            <Button 
                                mode="outlined" 
                                icon="clock" 
                                onPress={() => { setShowMealTimeSelector(true); }} 
                                disabled={loading} 
                                loading={loading}
                                style={styles.timeButton}
                            >
                                {`${mealTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}`}
                            </Button>
                            {showMealTimeSelector && <DateTimePicker mode="time" value={mealTime} onChange={onMealTimeChange} />}
                        </View>
                    ) : (
                        <View style={styles.timePickerContainer}>
                            <DateTimePicker mode="time" value={mealTime} onChange={onMealTimeChange} />
                        </View>
                    )}
                </View>

                <View style={styles.imageSection}>
                    {dialogType !== DialogType.EDIT && (!imageURI ? (
                        <Button 
                            icon="camera" 
                            mode="contained-tonal"
                            onPress={() => {
                                dispatch(clearImageURI());
                                setTimeout(() => {
                                    dispatch(setShowCamera());
                                }, 100);
                            }} 
                            disabled={loading}
                            style={[styles.cameraButton, { backgroundColor: 'tomato' }]}
                            textColor="white"
                        >
                            Add Meal Picture
                        </Button>
                    ) : (
                        <Surface style={styles.imageContainer} elevation={2}>
                            <Button 
                                icon="delete"
                                mode="contained-tonal"
                                onPress={() => dispatch(setImageURI(''))}
                                disabled={loading}
                                style={styles.deleteButton}
                                children={undefined}
                            />
                            <Image source={{ uri: imageURI }} style={styles.image} />
                        </Surface>
                    ))}

                    {dialogType === DialogType.EDIT && isDietDataEntry(currentDietData) && !imageURI && (!currentDietData.meal_picture || !currentDietData.meal_picture.length) && (
                        <Button 
                            icon="camera" 
                            mode="contained-tonal"
                            onPress={() => {
                                dispatch(clearImageURI());
                                setTimeout(() => {
                                    dispatch(setShowCamera());
                                }, 100);
                            }} 
                            disabled={loading}
                            style={[styles.cameraButton, { backgroundColor: 'tomato' }]}
                            textColor="white"
                        >
                            Add Meal Picture
                        </Button>
                    )}

                    {dialogType === DialogType.EDIT && isDietDataEntry(currentDietData) && imageURI && (!currentDietData.meal_picture || !currentDietData.meal_picture.length) && (
                        <Surface style={styles.imageContainer} elevation={2}>
                            <Button 
                                icon="delete"
                                mode="contained-tonal"
                                onPress={() => dispatch(setImageURI(''))}
                                disabled={loading}
                                style={styles.deleteButton}
                                children={undefined}
                            />
                            <Image source={{ uri: imageURI }} style={styles.image} />
                        </Surface>
                    )}

                    {dialogType === DialogType.EDIT && isDietDataEntry(currentDietData) && currentDietData.meal_picture && currentDietData.meal_picture.length && (
                        <Surface style={styles.imageContainer} elevation={2}>
                            <Button 
                                icon="delete"
                                mode="contained-tonal"
                                onPress={() => deleteImage()}
                                disabled={loading}
                                style={styles.deleteButton}
                                children={undefined}
                            />
                            <Image source={{ uri: currentDietData.meal_picture }} style={styles.image} />
                        </Surface>
                    )}
                </View>
            </Surface>

            <Divider style={styles.divider} />
            
            <View style={styles.formSubmission}>
                <Button 
                    mode="text" 
                    onPress={() => { 
                        dispatch(setDialog({ showDialog: false, dialogTab: null, dialogType: null })); 
                        dispatch(clearImageURI()); 
                    }} 
                    disabled={loading}
                >
                    Cancel
                </Button>
                <Button 
                    mode="contained" 
                    onPress={onSubmit} 
                    disabled={loading || (!imageURI && isDietDataEntry(currentDietData) && !currentDietData.meal_picture)} 
                    loading={loading}
                >
                    Submit
                </Button>
            </View>

            {showError && <HelperText type="error" visible={showError}>{errorString}</HelperText>}
        </View>
    )
}

const styles = StyleSheet.create({
    trackDietForm: {
        padding: 16,
    },
    formContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        gap: 24
    },
    timeSection: {
        alignItems: 'center',
        gap: 12
    },
    sectionTitle: {
        fontWeight: '600',
        color: '#1a1a1a'
    },
    timePickerContainer: {
        width: '100%',
        alignItems: 'center'
    },
    timeButton: {
        width: 200,
        borderRadius: 8
    },
    imageSection: {
        alignItems: 'center',
        gap: 16
    },
    cameraButton: {
        width: '100%',
        borderRadius: 8
    },
    imageContainer: {
        position: 'relative',
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#fff'
    },
    deleteButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 1,
        margin: 0
    },
    image: {
        width: 300,
        height: 300,
        resizeMode: 'cover'
    },
    divider: {
        marginVertical: 16
    },
    formSubmission: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12
    }
})