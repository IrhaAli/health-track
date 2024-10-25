import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import Dialog from "react-native-dialog";
import { Dropdown } from "react-native-element-dropdown";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useDispatch, useSelector } from "react-redux";
import { DialogType, setDialog } from "@/store/trackDialogSlice";
import { clearImageURI, setHideCamera, setImageURI, setShowCamera } from "@/store/cameraSlice";
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { AppDispatch, RootState } from "@/store/store";
import { router } from "expo-router";
import { Divider, Button, HelperText, Avatar } from 'react-native-paper';
import { getAuth } from "firebase/auth";
import { addWeightData, updateWeightData } from "@/store/trackSlice";
import { WeightDataEntry, isWeightDataEntry } from "@/types/track";
import { compose } from "redux";

enum WeightTypeEnum {
    LBS = 'lbs',
    KG = 'kg'
};

export default function TrackWeightForm() {
    const dispatch = useDispatch<AppDispatch>();
    const currentDate = useSelector((state: RootState) => state.track.currentDate);
    const storage = getStorage();
    const imageURI = useSelector((state: RootState) => state.camera.imageURI);
    const [loading, setLoading] = useState<boolean>(false);
    const [weightType, setWeightType] = useState<WeightTypeEnum>(WeightTypeEnum.KG);
    const [weight, setWeight] = useState<string>("");
    const [isWeightTypeFocus, setIsWeightTypeFocus] = useState<boolean>(false);
    const [showError, setShowError] = useState<boolean>(false);
    const [errorString, setErrorString] = useState<string | null>(null);
    const weightData = useSelector((state: RootState) => state.track.weightData);
    const dialogType: DialogType | null = useSelector((state: RootState) => state.trackDialog.dialogType);
    const weightTypeOptions = Object.values(WeightTypeEnum).map((type) => ({ label: type.charAt(0).toUpperCase() + type.slice(1), value: type }));
    const auth = getAuth();
    const [currentWeightData, setCurrentWeightData] = useState<WeightDataEntry | {}>({});
    const [imageToBeDelete, setImageToBeDelete] = useState<string | null>(null);

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
        return {}; // Return an empty object if conditions are not met
    };

    useEffect(() => {
        if (dialogType === DialogType.EDIT) {
            const entry: WeightDataEntry | {} = getWeightDataObject();
            if (entry && isWeightDataEntry(entry)) { setCurrentWeightData(entry); setWeight(String(entry.weight)); }
        }
    }, [dialogType, currentDate, weightData]); // Dependencies to re-run the effect

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
        console.log('delete image called');
        if (isWeightDataEntry(currentWeightData) && currentWeightData.picture) {
            console.log('condition meet');
            setImageToBeDelete(currentWeightData.picture);
            setCurrentWeightData({ ...currentWeightData, picture: null });
        }
        else { throw new Error(`Image not available for the current weight card!`); }
    };

    const onSubmit = async () => {
        const [year, month] = currentDate.split('-');
        const formattedMonth = `${year}-${month}`;
        const weightDataForMonth = weightData?.[formattedMonth] || [];

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

            if ((dialogType === DialogType.EDIT) && isWeightDataEntry(currentWeightData)) {
                if (!imageURI && !currentWeightData.picture) {
                    setShowError(true);
                    setErrorString('Please add meal picture!');
                    return;
                }
            }

            setLoading(true);

            try {
                const conversionRate: Record<string, number> = { lbs: 0.453592 };
                const convertedWeight = weightType !== "kg" ? parseFloat(weight) * (weightType.length === 0 ? 1 : conversionRate[weightType]) : parseFloat(weight);

                if (dialogType !== DialogType.EDIT) {
                    let weightData: WeightDataEntry = { user_id: auth.currentUser.uid, date: new Date(currentDate), weight: convertedWeight, measurement_unit: weightType.length === 0 ? "kg" : weightType, picture: imageURI ? await uploadImage() : '' }
                    dispatch(addWeightData({ currentDate: currentDate, addWeight: weightData }));
                }
                if (dialogType === DialogType.EDIT && isWeightDataEntry(currentWeightData)) {
                    if (imageToBeDelete) {
                        const match = imageToBeDelete.match(/weight%2F([^?]+)/);
                        if (match && match[1]) {
                            const id = match[1];
                            let weightImageRef = ref(storage, `weight/${id}`);
                            await deleteObject(weightImageRef);
                        } else { console.error("ID not found in the URL"); }
                    }

                    let updateWeight: WeightDataEntry = { ...currentWeightData, weight: convertedWeight, measurement_unit: weightType.length === 0 ? "kg" : weightType, picture: imageURI ? await uploadImage() : currentWeightData.picture ? currentWeightData.picture : '' }
                    dispatch(updateWeightData({ updateWeight, currentDate }));
                }

                // Ressetting Fields.
                setWeightType(WeightTypeEnum.KG);
                setWeight("");
                setIsWeightTypeFocus(false);
                dispatch(setHideCamera());
                dispatch(setImageURI(''));
                setLoading(false);
                dispatch(clearImageURI());
                // Ressetting Fields.

                dispatch(setDialog({ showDialog: false, dialogTab: null, dialogType: null }));
            } catch (error) { setLoading(false); }
        } else { router.push({ pathname: "/register" }); }
    }

    return (
        <View>
            <View style={styles.trackWeightForm}>
                <View style={styles.weightView}>
                    <Dialog.Input
                        style={[styles.input]}
                        placeholder="Add Weight"
                        value={weight}
                        onChangeText={setWeight}
                        autoCorrect={false}
                        autoCapitalize="none"
                        keyboardType="numeric"
                        maxLength={4}
                        underlineColorAndroid={'transparent'}
                        editable={!loading}
                    />
                    <Dropdown
                        style={[styles.dropdown, isWeightTypeFocus && { borderColor: "blue" }]}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        iconStyle={styles.iconStyle}
                        data={weightTypeOptions}
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        placeholder={!isWeightTypeFocus ? "Select Weight Unit" : "..."}
                        value={weightType}
                        onFocus={() => setIsWeightTypeFocus(true)}
                        onBlur={() => setIsWeightTypeFocus(false)}
                        onChange={(item: any) => {
                            setWeightType(item.value);
                            setIsWeightTypeFocus(false);
                        }}
                        renderRightIcon={() => (<AntDesign style={styles.icon} color={isWeightTypeFocus ? "blue" : "black"} name="Safety" size={20} />)}
                        disable={loading}
                    />
                </View>

                {dialogType !== DialogType.EDIT && (!imageURI ? (<Button icon="camera" mode="contained" onPress={() => { dispatch(setShowCamera()); }} disabled={loading}>Add Weight Picture</Button>) : (
                    <View>
                        <Button icon={({ size, color }) => (<Avatar.Icon size={24} icon="delete" color="#fff" />)} mode="text" onPress={() => { dispatch(setImageURI('')); }} disabled={loading} style={[{ position: 'absolute', right: -15, zIndex: 999, top: 15 }]}>{''}</Button>
                        <Image source={{ uri: imageURI }} style={[{ borderWidth: 1, width: 100, height: 200, resizeMode: 'contain' }]} />
                    </View>
                ))}

                {dialogType === DialogType.EDIT && isWeightDataEntry(currentWeightData) && !imageURI && (!currentWeightData.picture || !currentWeightData.picture.length) && (<Button icon="camera" mode="contained" onPress={() => { dispatch(setShowCamera()); }} disabled={loading}>Add Weight Picture</Button>)}

                {dialogType === DialogType.EDIT && isWeightDataEntry(currentWeightData) && imageURI && (!currentWeightData.picture || !currentWeightData.picture.length) && (
                    <View>
                        <Button icon={({ size, color }) => (<Avatar.Icon size={24} icon="delete" color="#fff" />)} mode="text" onPress={() => { dispatch(setImageURI('')); }} disabled={loading} style={[{ position: 'absolute', right: -15, zIndex: 999, top: 15 }]}>{''}</Button>
                        <Image source={{ uri: imageURI }} style={[{ borderWidth: 1, width: 100, height: 200, resizeMode: 'contain' }]} />
                    </View>
                )}

                {dialogType === DialogType.EDIT && isWeightDataEntry(currentWeightData) && currentWeightData.picture && currentWeightData.picture.length && (
                    <View>
                        <Button icon={({ size, color }) => (<Avatar.Icon size={24} icon="delete" color="#fff" />)} mode="text" onPress={() => { deleteImage(); }} disabled={loading} style={[{ position: 'absolute', right: -15, zIndex: 999, top: 15 }]}>{''}</Button>
                        <Image source={{ uri: currentWeightData.picture }} style={[{ borderWidth: 1, width: 100, height: 200, resizeMode: 'contain' }]} />
                    </View>
                )}
            </View>

            <Divider />
            <View style={styles.formSubmission}>
                <Button mode="text" onPress={() => { dispatch(setDialog({ showDialog: false, dialogTab: null, dialogType: null })); dispatch(clearImageURI()); }} disabled={loading} textColor="blue">Cancel</Button>
                <Button mode="contained" onPress={onSubmit} disabled={loading || !weight || (!imageURI && isWeightDataEntry(currentWeightData) && !currentWeightData.picture)} loading={loading}>{dialogType === DialogType.EDIT ? 'Update' : 'Submit'}</Button>
            </View>

            {showError && <HelperText type="error" visible={showError}>{errorString}</HelperText>}
        </View>
    )
}

const styles = StyleSheet.create({
    trackWeightForm: {
        paddingVertical: 10,
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center'
    },
    weightView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        alignContent: 'center'
    },
    input: {
        paddingLeft: 20,
        paddingRight: 130,
        borderColor: "gray",
        borderWidth: 0.5,
        borderRadius: 3,
        fontSize: 16,
        color: 'black',
        marginTop: 0,
        marginLeft: 0,
        marginRight: 0,
        marginBottom: 0,
        borderTopLeftRadius: 3,
        borderBottomLeftRadius: 3,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
        borderTopWidth: 0.5,
        borderRightWidth: 0,
        borderBottomWidth: 0.5,
        borderLeftWidth: 0.5,
    },
    dropdown: {
        flex: 0.75,
        borderColor: "gray",
        paddingHorizontal: 8,
        paddingVertical: 9.2,
        marginTop: -20,
        marginLeft: -11,
        marginRight: 0,
        marginBottom: 0,
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        borderTopRightRadius: 3,
        borderBottomRightRadius: 3,
        borderTopWidth: 0.5,
        borderRightWidth: 0.5,
        borderBottomWidth: 0.5,
        borderLeftWidth: 0
    },
    icon: {
        marginRight: 5,
    },
    placeholderStyle: {
        fontSize: 16,
    },
    selectedTextStyle: {
        fontSize: 16,
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    formSubmission: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingTop: 15
    },
})