import React, { useState } from "react";
import { Pressable, StyleSheet, View, Text, ActivityIndicator } from "react-native";
import Dialog from "react-native-dialog";
import { Dropdown } from "react-native-element-dropdown";
import AntDesign from "@expo/vector-icons/AntDesign";
import { addDoc, collection } from "firebase/firestore";
import { router } from "expo-router";
import { db } from "../../firebaseConfig";
import { useDispatch } from "react-redux";
import { setHideDialog } from "@/store/trackDialogSlice";

interface TrackWaterFormProps {
    currentDate: string;
    userId: string;
}

enum WaterTypeEnum {
    MILLILITRES = "millilitres",
    LITRES = "litres",
    CUPS = "cups"
};

export default function TrackWaterForm({ currentDate, userId }: TrackWaterFormProps) {
    const dispatch = useDispatch();
    const [water, setWater] = useState("");
    const [isWaterTypeFocus, setIsWaterTypeFocus] = useState(false);
    const [waterType, setWaterType] = useState(WaterTypeEnum.MILLILITRES);
    const [loading, setLoading] = useState(false);

    const waterTypeOptions = Object.values(WaterTypeEnum).map((type) => ({ label: type, value: type }));


    const calculateIntakeAmount = (): number => {
        const conversionRate: Record<string, number> = { cups: 250, litres: 1000 };
        const waterAmount = parseFloat(water);

        if (waterType !== "millilitres") {
            const rate = waterType.length === 0 ? 1 : conversionRate[waterType];
            return waterAmount * rate;
        }

        return waterAmount;
    }

    const onSubmit = async () => {
        if (!userId) { router.push({ pathname: "/(signup)" }); }

        setLoading(true);
        await addDoc(collection(db, "water_tracking"), { user_id: userId, date: currentDate, intake_amount: calculateIntakeAmount(), waterType });

        // Resetting Fields.
        setWater("");
        setIsWaterTypeFocus(false);
        setWaterType(WaterTypeEnum.MILLILITRES);
        setLoading(false);
        // Resetting Fields.

        dispatch(setHideDialog())
    }

    return (
        <View>
            <View style={styles.trackWaterForm}>
                <Dialog.Input
                    style={[styles.input]}
                    placeholder="Add water here..."
                    value={water}
                    onChangeText={setWater}
                    autoCorrect={false}
                    autoCapitalize="none"
                    keyboardType="numeric"
                    maxLength={4}
                    editable={!loading}
                ></Dialog.Input>
                <Dropdown style={[styles.dropdown, isWaterTypeFocus && { borderColor: "blue" }, styles.flexItem]}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    iconStyle={styles.iconStyle}
                    data={waterTypeOptions}
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    placeholder={!isWaterTypeFocus ? "Select Water Unit" : "..."}
                    value={waterType}
                    onFocus={() => setIsWaterTypeFocus(true)}
                    onBlur={() => setIsWaterTypeFocus(false)}
                    onChange={(item: any) => {
                        setWaterType(item.value as WaterTypeEnum);
                        setIsWaterTypeFocus(false);
                    }}
                    renderLeftIcon={() => (
                        <AntDesign style={styles.icon} color={isWaterTypeFocus ? "blue" : "black"} name="Safety" size={20} />
                    )}
                    disable={loading}
                />
            </View>

            <View style={styles.formSubmission}>
                <Pressable onPress={() => dispatch(setHideDialog())} disabled={loading}>
                    <Text style={styles.cancelButton}>Cancel</Text>
                </Pressable>
                <Pressable onPress={onSubmit} style={styles.submitButton} disabled={loading}>
                    <Text style={styles.submitButtonText}>{loading ? 'Loading...' : 'Submit'}</Text>
                    {loading && <ActivityIndicator color={'white'} />}
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    trackWaterForm: {
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 30
    },
    input: {
        height: 50,
        paddingHorizontal: 20,
        borderColor: "gray",
        borderWidth: 0.5,
        borderRadius: 3,
        fontSize: 16,
        marginTop: 20,
        color: 'black'
    },
    icon: {
        marginRight: 5,
    },
    dropdown: {
        height: 50,
        borderColor: "gray",
        borderWidth: 0.5,
        borderRadius: 7,
        paddingHorizontal: 8,
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
    flexItem: {
        flex: 1
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