import React, { useEffect, useState } from "react";
import { View, StyleSheet, Platform, Image } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { setHideCamera, setShowCamera, setImageURI, clearImageURI } from "@/store/cameraSlice";
import { DialogType, setDialog } from "@/store/trackDialogSlice";
import { AppDispatch, RootState } from "@/store/store";
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { Divider, Button, Text, HelperText, Surface } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addDietData, updateDietData } from "@/store/trackSlice";
import { DietDataEntry, isDietDataEntry } from "@/types/track";
import i18n from "@/services/i18n";

export default function TrackDietForm() {
    const dispatch = useDispatch<AppDispatch>();
    const { imageURI } = useSelector((state: RootState) => state.camera);
    const { currentDate, dietData } = useSelector((state: RootState) => state.track);
    const dialogType = useSelector((state: RootState) => state.trackDialog.dialogType);

    const storage = getStorage();
    const [mealTime, setMealTime] = useState(() => {
        const date = new Date(currentDate + 'T00:00:00');
        const now = new Date();
        date.setHours(now.getHours(), now.getMinutes());
        return date;
    });
    const [showMealTimeSelector, setShowMealTimeSelector] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorString, setErrorString] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [imageToBeDelete, setImageToBeDelete] = useState<string | null>(null);
    const [currentDietData, setCurrentDietData] = useState<DietDataEntry | {}>({});

    useEffect(() => {
        AsyncStorage.getItem('session').then(userString => {
            if (userString) setCurrentUser(JSON.parse(userString));
        });
    }, []);

    useEffect(() => {
        if (dialogType === DialogType.EDIT) {
            const [year, month] = currentDate.split('-');
            const formattedMonth = `${year}-${month}`;
            
            const entry = dietData[formattedMonth]?.find((entry: DietDataEntry) => 
                new Date(entry.date).toLocaleDateString().split('/').reverse().join('-') === currentDate
            );

            if (entry && isDietDataEntry(entry)) {
                setCurrentDietData(entry);
                const date = new Date(currentDate + 'T00:00:00');
                const entryDate = new Date(entry.date);
                date.setHours(entryDate.getHours(), entryDate.getMinutes());
                setMealTime(date);
            }
        }
    }, [dialogType, currentDate, dietData]);

    const onMealTimeChange = (_: any, date?: Date) => {
        setShowMealTimeSelector(false);
        if (date) {
            const newDate = new Date(currentDate + 'T00:00:00');
            newDate.setHours(date.getHours(), date.getMinutes());
            setMealTime(newDate);
        }
    };

    const deleteImage = () => {
        if (isDietDataEntry(currentDietData) && currentDietData.meal_picture) {
            setImageToBeDelete(currentDietData.meal_picture);
            setCurrentDietData({ ...currentDietData, meal_picture: null });
        }
    };

    const uploadImage = async () => {
        if (!imageURI) throw new Error('Invalid URI for Diet');
        const blob = await (await fetch(imageURI)).blob();
        const refer = ref(storage, `diet/${Date.now()}`);
        const snapshot = await uploadBytes(refer, blob);
        return getDownloadURL(snapshot.ref);
    };

    const onSubmit = async () => {
        setShowError(false);
        setErrorString(null);

        if (!currentUser?.uid) {
            router.push({ pathname: "/register" });
            return;
        }

        if ((!dialogType || dialogType !== DialogType.EDIT) && !imageURI) {
            setShowError(true);
            setErrorString(i18n.t('trackDiet.errors.addPicture'));
            return;
        }

        if (dialogType === DialogType.EDIT && isDietDataEntry(currentDietData) && !imageURI && !currentDietData.meal_picture) {
            setShowError(true);
            setErrorString(i18n.t('trackDiet.errors.addPicture'));
            return;
        }

        setLoading(true);

        try {
            if (dialogType !== DialogType.EDIT) {
                const addDiet = { 
                    user_id: currentUser.uid, 
                    date: mealTime, 
                    meal_picture: await uploadImage() 
                };
                dispatch(addDietData({ currentDate, addDiet }));
            } else if (isDietDataEntry(currentDietData)) {
                if (imageToBeDelete) {
                    const id = imageToBeDelete.match(/diet%2F([^?]+)/)?.[1];
                    if (id) {
                        await deleteObject(ref(storage, `diet/${id}`));
                    }
                }

                const updateDiet = {
                    ...currentDietData,
                    date: mealTime,
                    meal_picture: imageURI ? await uploadImage() : currentDietData.meal_picture || ''
                };
                dispatch(updateDietData({ updateDiet, currentDate }));
            }

            const resetDate = new Date(currentDate + 'T00:00:00');
            const now = new Date();
            resetDate.setHours(now.getHours(), now.getMinutes());
            setMealTime(resetDate);
            setShowMealTimeSelector(false);
            dispatch(setHideCamera());
            dispatch(setImageURI(''));
            dispatch(clearImageURI());
            dispatch(setDialog({ showDialog: false, dialogTab: null, dialogType: null }));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCameraPress = () => {
        dispatch(clearImageURI());
        setTimeout(() => dispatch(setShowCamera()), 100);
    };

    return (
        <View style={styles.trackDietForm}>
            <Surface style={styles.formContainer} elevation={3}>
                <View style={styles.timeSection}>
                    <Text variant="titleLarge" style={styles.sectionTitle}>{i18n.t('trackDiet.timeOfMeal')}</Text>
                    <View style={styles.timePickerContainer}>
                        {Platform.OS === "android" ? (
                            <>
                                <Button 
                                    mode="outlined" 
                                    icon="clock"
                                    onPress={() => setShowMealTimeSelector(true)}
                                    disabled={loading}
                                    loading={loading}
                                    style={styles.timeButton}
                                >
                                    {mealTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}
                                </Button>
                                {showMealTimeSelector && <DateTimePicker mode="time" value={mealTime} onChange={onMealTimeChange} />}
                            </>
                        ) : (
                            <DateTimePicker mode="time" value={mealTime} onChange={onMealTimeChange} />
                        )}
                    </View>
                </View>

                <View style={styles.imageSection}>
                    {!imageURI && (!isDietDataEntry(currentDietData) || !currentDietData.meal_picture) && (
                        <Button 
                            icon="camera"
                            mode="contained-tonal"
                            onPress={handleCameraPress}
                            disabled={loading}
                            style={[styles.cameraButton, { backgroundColor: 'tomato' }]}
                            textColor="white"
                        >
                            {i18n.t('trackDiet.addMealPicture')}
                        </Button>
                    )}

                    {(imageURI || (isDietDataEntry(currentDietData) && currentDietData.meal_picture)) && (
                        <Surface style={styles.imageContainer} elevation={2}>
                            <Button 
                                icon="delete"
                                mode="contained-tonal"
                                onPress={() => imageURI ? dispatch(setImageURI('')) : deleteImage()}
                                disabled={loading}
                                style={styles.deleteButton} children={undefined} />
                            <Image 
                                source={{ uri: imageURI || (isDietDataEntry(currentDietData) ? currentDietData.meal_picture : '') }} 
                                style={styles.image} 
                            />
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
                    {i18n.t('trackDiet.cancel')}
                </Button>
                <Button 
                    mode="contained"
                    onPress={onSubmit}
                    disabled={loading || (!imageURI && isDietDataEntry(currentDietData) && !currentDietData.meal_picture)}
                    loading={loading}
                    style={styles.button}
                >
                    {i18n.t('trackDiet.submit')}
                </Button>
            </View>

            {showError && <HelperText type="error" visible={showError}>{errorString}</HelperText>}
        </View>
    );
}

const styles = StyleSheet.create({
    trackDietForm: { padding: 16 },
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
        gap: 16,
        width: '100%'
    },
    cameraButton: {
        width: '100%',
        borderRadius: 8
    },
    imageContainer: {
        position: 'relative',
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#fff',
        width: '100%'
    },
    deleteButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 1,
        margin: 0
    },
    image: {
        width: '100%',
        height: 300,
        resizeMode: 'cover'
    },
    divider: { marginVertical: 16 },
    formSubmission: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12
    },
    button: {
        borderRadius: 8,
        minWidth: 100
    }
});