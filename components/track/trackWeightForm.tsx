import React, { useEffect, useState } from "react";
import { View, StyleSheet, Image, TouchableWithoutFeedback, Keyboard, Dimensions } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useDispatch, useSelector } from "react-redux";
import { DialogType, setDialog } from "@/store/trackDialogSlice";
import { clearImageURI, setHideCamera, setImageURI, setShowCamera } from "@/store/cameraSlice";
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { AppDispatch, RootState } from "@/store/store";
import { router } from "expo-router";
import { Divider, Button, HelperText, Surface, TextInput } from 'react-native-paper';
import { addWeightData, updateWeightData } from "@/store/trackSlice";
import { WeightDataEntry, isWeightDataEntry } from "@/types/track";
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from "@/services/i18n";
import { Colors } from "@/app/theme";

enum WeightTypeEnum {
    LBS = 'lbs',
    KG = 'kg'
};

interface CameraState {
    imageURI: string;
}

export default function TrackWeightForm() {
    const dispatch = useDispatch<AppDispatch>();
    const currentDate = useSelector((state: RootState) => state.track.currentDate);
    const storage = getStorage();
    const imageURI = useSelector((state: RootState) => (state.camera as CameraState).imageURI);
    const [loading, setLoading] = useState<boolean>(false);
    const [weightType, setWeightType] = useState<WeightTypeEnum>(WeightTypeEnum.KG);
    const [weight, setWeight] = useState<string>("");
    const [isWeightTypeFocus, setIsWeightTypeFocus] = useState<boolean>(false);
    const [showError, setShowError] = useState<boolean>(false);
    const [errorString, setErrorString] = useState<string | null>(null);
    const weightData = useSelector((state: RootState) => state.track.weightData);
    const dialogType: DialogType | null = useSelector((state: RootState) => state.trackDialog.dialogType);
    const weightTypeOptions = Object.values(WeightTypeEnum).map((type) => ({ label: type.charAt(0).toUpperCase() + type.slice(1), value: type }));
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [currentWeightData, setCurrentWeightData] = useState<WeightDataEntry | {}>({});
    const [imageToBeDelete, setImageToBeDelete] = useState<string | null>(null);

    useEffect(() => {
        const getUser = async () => {
            const userString = await AsyncStorage.getItem('session');
            if (userString) {
                const user = JSON.parse(userString);
                setCurrentUser(user);
            }
        };
        getUser();
    }, []);

    const getWeightDataObject = (): WeightDataEntry | {} => {
        const [year, month] = currentDate.split('-');
        const formattedMonth = `${year}-${month}`;

        if (!Array.isArray(weightData)) {
            if (formattedMonth in weightData) {
                if (weightData[formattedMonth] && weightData[formattedMonth].length > 0) {
                    const entry = weightData[formattedMonth].find((entry: WeightDataEntry) => new Date(entry.date).toLocaleDateString().split('/').reverse().join('-') === currentDate);
                    if (entry) { return entry; }
                }
            }
        }
        return {};
    };

    useEffect(() => {
        if (dialogType === DialogType.EDIT) {
            const entry: WeightDataEntry | {} = getWeightDataObject();
            if (entry && isWeightDataEntry(entry)) { setCurrentWeightData(entry); setWeight(String(entry.weight)); }
        }
    }, [dialogType, currentDate, weightData]);

    const uploadImage = async () => {
        if (!imageURI) { throw new Error(`Invalid URI for Weight:`); }

        const response = await fetch(imageURI);

        const blob = await response.blob();
        let refer = ref(storage, `weight/${new Date().getTime()}`);
        return uploadBytes(refer, blob)
            .then((snapshot) => { return getDownloadURL(snapshot.ref); })
            .then((downloadUrl) => { return downloadUrl; });
    };

    const deleteImage = async () => {
        if (isWeightDataEntry(currentWeightData) && currentWeightData.picture) {
            setImageToBeDelete(currentWeightData.picture);
            setCurrentWeightData({ ...currentWeightData, picture: null });
        }
        else { throw new Error(`Image not available for the current weight card!`); }
    };

    const onSubmit = async () => {
        Keyboard.dismiss();
        const [year, month] = currentDate.split('-');
        const formattedMonth = `${year}-${month}`;
        const weightDataForMonth = weightData?.[formattedMonth] || [];

        setShowError(false);
        setErrorString(null);

        const existingEntry = weightDataForMonth.find(
            entry => new Date(entry.date).toLocaleDateString().split('/').reverse().join('-') === currentDate
        );

        if ((dialogType !== DialogType.EDIT && existingEntry) || (dialogType === DialogType.EDIT && !existingEntry)) {
            setShowError(true);
            setErrorString(i18n.t(`trackWeight.errors.${dialogType === DialogType.EDIT ? 'noData' : 'existingData'}`));
            return;
        }

        if (currentUser?.uid) {
            if ((dialogType !== DialogType.EDIT) && !imageURI) {
                setShowError(true);
                setErrorString(i18n.t('trackWeight.errors.addPicture'));
                return;
            }

            if ((dialogType === DialogType.EDIT) && isWeightDataEntry(currentWeightData) && !imageURI && !currentWeightData.picture) {
                setShowError(true);
                setErrorString(i18n.t('trackWeight.errors.addPicture'));
                return;
            }

            setLoading(true);

            try {
                const conversionRate: Record<string, number> = { lbs: 0.453592 };
                const convertedWeight = weightType !== "kg" ? parseFloat(weight) * (weightType.length === 0 ? 1 : conversionRate[weightType]) : parseFloat(weight);

                if (dialogType !== DialogType.EDIT) {
                    let weightData: WeightDataEntry = { user_id: currentUser.uid, date: new Date(currentDate + 'T' + new Date().toISOString().split('T')[1]), weight: convertedWeight, measurement_unit: weightType.length === 0 ? "kg" : weightType, picture: imageURI ? await uploadImage() : '' }
                    dispatch(addWeightData({ currentDate: currentDate, addWeight: weightData }));
                }
                if (dialogType === DialogType.EDIT && isWeightDataEntry(currentWeightData)) {
                    if (imageToBeDelete) {
                        const match = imageToBeDelete.match(/weight%2F([^?]+)/);
                        if (match && match[1]) {
                            const id = match[1];
                            let weightImageRef = ref(storage, `weight/${id}`);
                            await deleteObject(weightImageRef);
                        }
                    }

                    let updateWeight: WeightDataEntry = { ...currentWeightData, weight: convertedWeight, measurement_unit: weightType.length === 0 ? "kg" : weightType, picture: imageURI ? await uploadImage() : currentWeightData.picture ? currentWeightData.picture : '' }
                    dispatch(updateWeightData({ updateWeight, currentDate }));
                }

                setWeightType(WeightTypeEnum.KG);
                setWeight("");
                setIsWeightTypeFocus(false);
                dispatch(setHideCamera());
                dispatch(setImageURI(''));
                setLoading(false);
                dispatch(clearImageURI());

                dispatch(setDialog({ showDialog: false, dialogTab: null, dialogType: null }));
            } catch (error) { setLoading(false); }
        } else { router.push({ pathname: "/register" }); }
    }

    const handleCancel = () => {
        Keyboard.dismiss();
        dispatch(setDialog({ showDialog: false, dialogTab: null, dialogType: null }));
        dispatch(clearImageURI());
    }

    const handleShowCamera = () => {
        Keyboard.dismiss();
        dispatch(setShowCamera());
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <View style={styles.trackWeightForm}>
                    <Surface style={styles.inputContainer} elevation={3}>
                        <View style={styles.weightInputSection}>
                            <TextInput
                                style={styles.input}
                                placeholder={i18n.t('trackWeight.addWeight')}
                                value={weight}
                                onChangeText={setWeight}
                                autoCorrect={false}
                                autoCapitalize="none"
                                keyboardType="numeric"
                                maxLength={4}
                                editable={!loading}
                                mode="flat"
                            />
                            
                            <Dropdown
                                style={[styles.dropdown, isWeightTypeFocus && { borderColor: "#6200ee" }]}
                                placeholderStyle={styles.placeholderStyle}
                                selectedTextStyle={styles.selectedTextStyle}
                                iconStyle={styles.iconStyle}
                                data={weightTypeOptions}
                                maxHeight={300}
                                labelField="label"
                                valueField="value"
                                placeholder={!isWeightTypeFocus ? i18n.t('trackWeight.selectUnit') : "..."}
                                value={weightType}
                                onFocus={() => setIsWeightTypeFocus(true)}
                                onBlur={() => setIsWeightTypeFocus(false)}
                                onChange={(item: any) => {
                                    setWeightType(item.value);
                                    setIsWeightTypeFocus(false);
                                }}
                                renderRightIcon={() => (
                                    <AntDesign 
                                        style={styles.icon} 
                                        color={isWeightTypeFocus ? "#6200ee" : "#666"} 
                                        name="Safety" 
                                        size={18} 
                                    />
                                )}
                                disable={loading}
                            />
                        </View>
                    </Surface>

                    {dialogType !== DialogType.EDIT && (!imageURI ? (
                        <Button 
                            icon="camera" 
                            mode="contained-tonal"
                            onPress={() => {
                                dispatch(clearImageURI());
                                setTimeout(() => {
                                    handleShowCamera();
                                }, 100);
                            }} 
                            disabled={loading}
                            style={[styles.cameraButton, { backgroundColor: Colors.light.submitButton }]}
                            textColor="white"
                        >
                            {i18n.t('trackWeight.addWeightPicture')}
                        </Button>
                    ) : (
                        <Surface style={styles.imageContainer} elevation={2}>
                            <Button 
                                    icon="delete"
                                    mode="contained-tonal"
                                    onPress={() => dispatch(setImageURI(''))}
                                    disabled={loading}
                                    style={styles.deleteButton} children={undefined} />
                            <Image 
                                source={{ uri: imageURI }} 
                                style={styles.image} 
                            />
                        </Surface>
                    ))}

                    {dialogType === DialogType.EDIT && isWeightDataEntry(currentWeightData) && !imageURI && (!currentWeightData.picture || !currentWeightData.picture.length) && (
                        <Button 
                            icon="camera" 
                            mode="contained-tonal"
                            onPress={() => {
                                dispatch(clearImageURI());
                                setTimeout(() => {
                                    handleShowCamera();
                                }, 100);
                            }} 
                            disabled={loading}
                            style={[styles.cameraButton, { backgroundColor: Colors.light.submitButton }]}
                            textColor="white"
                        >
                            {i18n.t('trackWeight.addWeightPicture')}
                        </Button>
                    )}

                    {dialogType === DialogType.EDIT && isWeightDataEntry(currentWeightData) && imageURI && (!currentWeightData.picture || !currentWeightData.picture.length) && (
                        <Surface style={styles.imageContainer} elevation={2}>
                            <Button 
                                icon="delete"
                                mode="contained-tonal"
                                onPress={() => dispatch(setImageURI(''))}
                                disabled={loading}
                                style={styles.deleteButton} children={undefined} />
                            <Image 
                                source={{ uri: imageURI }} 
                                style={styles.image} 
                            />
                        </Surface>
                    )}

                    {dialogType === DialogType.EDIT && isWeightDataEntry(currentWeightData) && currentWeightData.picture && currentWeightData.picture.length && (
                        <Surface style={styles.imageContainer} elevation={2}>
                            <Button 
                                icon="delete"
                                mode="contained-tonal"
                                onPress={() => deleteImage()}
                                disabled={loading}
                                style={styles.deleteButton} children={undefined} />
                            <Image 
                                source={{ uri: currentWeightData.picture }} 
                                style={styles.image} 
                            />
                        </Surface>
                    )}
                </View>

                <Divider style={styles.divider} />
                
                <View style={styles.formSubmission}>
                    <Button 
                        mode="text" 
                        onPress={handleCancel} 
                        disabled={loading}
                    >
                        {i18n.t('trackWeight.cancel')}
                    </Button>
                    <Button 
                        mode="contained" 
                        onPress={onSubmit} 
                        disabled={loading || !weight || (!imageURI && isWeightDataEntry(currentWeightData) && !currentWeightData.picture)} 
                        loading={loading}
                        style={styles.button}
                        buttonColor={(!loading && weight && imageURI) ? Colors.light.submitButton : Colors.light.disabledButton}
                    >
                        {dialogType === DialogType.EDIT ? i18n.t('trackWeight.update') : i18n.t('trackWeight.submit')}
                    </Button>
                </View>

                {showError && <HelperText type="error" visible={showError}>{errorString}</HelperText>}
            </View>
        </TouchableWithoutFeedback>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    trackWeightForm: {
        gap: 16
    },
    inputContainer: {
        borderRadius: 12,
        backgroundColor: '#fff',
        padding: 8
    },
    weightInputSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    input: {
        flex: 1,
        height: 44,
        backgroundColor: 'transparent',
        fontSize: 16
    },
    dropdown: {
        width: 120,
        height: 44,
        borderRadius: 8,
        paddingHorizontal: 8,
        backgroundColor: '#f5f5f5'
    },
    placeholderStyle: {
        fontSize: 14,
        color: '#666'
    },
    selectedTextStyle: {
        fontSize: 14,
        color: '#1a1a1a'
    },
    iconStyle: {
        width: 18,
        height: 18
    },
    icon: {
        marginRight: 4
    },
    cameraButton: {
        borderRadius: 8
    },
    imageContainer: {
        position: 'relative',
        borderRadius: 12,
        overflow: 'hidden',
        alignSelf: 'stretch',
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
    divider: {
        marginVertical: 16
    },
    formSubmission: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12
    },
    button: {
        borderRadius: 8,
        minWidth: 100
    }
})