import React, { useState } from "react";
import { Pressable, View, Text, StyleSheet, ActivityIndicator, Alert, Image } from "react-native";
import Dialog from "react-native-dialog";
import { Dropdown } from "react-native-element-dropdown";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useDispatch, useSelector } from "react-redux";
import { setHideDialog } from "@/store/trackDialogSlice";
import { setHideCamera, setImageURI, setShowCamera } from "@/store/cameraSlice";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { RootState } from "@/store/store";
import { router } from "expo-router";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { Divider, Button } from 'react-native-paper';

enum WeightTypeEnum {
    LBS = 'lbs',
    KG = 'kg'
};

export default function TrackWeightForm() {
    const dispatch = useDispatch();
    const currentDate = useSelector((state: RootState) => state.track.currentDate);
    const userId = useSelector((state: RootState) => state.user.userId);
    const storage = getStorage();
    const imageURI = useSelector((state: RootState) => state.camera.imageURI);
    const [loading, setLoading] = useState(false);
    const [weightType, setWeightType] = useState(WeightTypeEnum.KG);
    const [weight, setWeight] = useState("");
    const [isWeightTypeFocus, setIsWeightTypeFocus] = useState(false);

    const weightTypeOptions = Object.values(WeightTypeEnum).map((type) => ({ label: type, value: type }));

    const uploadImage = async () => {
        if (!imageURI) { throw new Error(`Invalid URI for Weight:`); }

        const response = await fetch(imageURI);

        const blob = await response.blob();
        let refer = ref(storage, `weight/${new Date().getTime()}`);
        return uploadBytes(refer, blob)
            .then((snapshot) => { return getDownloadURL(snapshot.ref); })
            .then((downloadUrl) => { return downloadUrl; });
    };

    const onSubmit = async () => {
        if (!userId) { router.push({ pathname: "/(signup)" }); }

        if (!imageURI) { Alert.alert("Please add a picture of your meal."); return; }
        setLoading(true);

        const conversionRate: Record<string, number> = { lbs: 0.453592 };
        const convertedWeight = weightType !== "kg" ? parseFloat(weight) * (weightType.length === 0 ? 1 : conversionRate[weightType]) : weight;

        await addDoc(collection(db, "weight_tracking"), { user_id: userId, date: currentDate, weight: convertedWeight, measurement_unit: weightType.length === 0 ? "kg" : weightType, picture: imageURI ? await uploadImage() : '', });
        // Ressetting Fields.
        setWeight(WeightTypeEnum.KG);
        setWeight("");
        setIsWeightTypeFocus(false);
        dispatch(setHideCamera());
        dispatch(setImageURI(''));
        setLoading(false);
        // Ressetting Fields.

        dispatch(setHideDialog());
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
                        renderRightIcon={() => ( <AntDesign style={styles.icon} color={isWeightTypeFocus ? "blue" : "black"} name="Safety" size={20}/> )}
                        disable={loading}
                    />
                </View>

                {!imageURI ? (
                    <Pressable style={styles.button} onPress={() => { dispatch(setHideDialog()); dispatch(setShowCamera()); }} disabled={loading}>
                        <Text style={styles.buttonText}>Add Weight Picture</Text>
                    </Pressable>
                ) : (
                    <>
                        <Pressable onPress={() => { dispatch(setImageURI('')); }} disabled={loading}>
                            <Text style={styles.imageButtonText}>X</Text>
                        </Pressable>
                        <Image source={{ uri: imageURI }} width={100} height={200} resizeMode="contain" />
                    </>
                )}
            </View>

            <Divider />
            <View style={styles.formSubmission}>
                <Button mode="text" onPress={() => dispatch(setHideDialog())} disabled={loading} textColor="blue">Cancel</Button>
                <Button mode="contained" onPress={onSubmit} disabled={loading}>{loading ? ( <>Loading... <ActivityIndicator color="white" /></>) : ('Submit')}</Button>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    trackWeightForm: {
        paddingVertical: 10,
        // backgroundColor: 'white',
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
        paddingHorizontal: 100,
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
    button: {
        backgroundColor: "red",
        height: 45,
        borderColor: "gray",
        borderWidth: 1,
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
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
    buttonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "700",
        backgroundColor: 'red',
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 3
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
    },
    imageButtonText: {
        color: 'black',
        fontWeight: '700',
        fontSize: 18,
        marginLeft: -2
    },
})