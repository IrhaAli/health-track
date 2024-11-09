import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Dialog from "react-native-dialog";
import { Dropdown } from "react-native-element-dropdown";
import AntDesign from "@expo/vector-icons/AntDesign";
import { router } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { DialogType, setDialog } from "@/store/trackDialogSlice";
import { AppDispatch, RootState } from "@/store/store";
import { Divider, Button, HelperText, Text, Surface, TextInput } from 'react-native-paper';
import { getAuth } from "firebase/auth";
import { addWaterData, updateWaterData } from "@/store/trackSlice";
import { WaterDataEntry, WaterDataState, isWaterDataEntry } from "@/types/track";
import { clearImageURI } from "@/store/cameraSlice";

enum WaterTypeEnum {
    MILLILITRES = "millilitres",
    LITRES = "litres",
    CUPS = "cups"
};

export default function TrackWaterForm() {
    const dispatch = useDispatch<AppDispatch>();
    const currentDate = useSelector((state: RootState) => state.track.currentDate);
    const waterData: WaterDataState = useSelector((state: RootState) => state.track.waterData);
    const [water, setWater] = useState("");
    const [isWaterTypeFocus, setIsWaterTypeFocus] = useState<boolean>(false);
    const [waterType, setWaterType] = useState<WaterTypeEnum>(WaterTypeEnum.MILLILITRES);
    const [loading, setLoading] = useState<boolean>(false);
    const [showError, setShowError] = useState<boolean>(false);
    const [errorString, setErrorString] = useState<string | null>(null);
    const dialogType: DialogType | null = useSelector((state: RootState) => state.trackDialog.dialogType);
    const auth = getAuth();
    const waterTypeOptions = Object.values(WaterTypeEnum).map((type) => ({ label: type.charAt(0).toUpperCase() + type.slice(1), value: type }));
    const [currentWaterData, setCurrentWaterData] = useState<WaterDataEntry | {}>({});

    const getWaterDataObject = (): WaterDataEntry | {} => {
        const [year, month] = currentDate.split('-');
        const formattedMonth = `${year}-${month}`;

        if (!Array.isArray(waterData)) {
            if (formattedMonth in waterData) {
                if (waterData[formattedMonth] && waterData[formattedMonth].length > 0) {
                    const entry = waterData[formattedMonth].find((entry: WaterDataEntry) => new Date(entry.date).toLocaleDateString().split('/').reverse().join('-') === currentDate);
                    if (entry) { return entry; }
                }
            }
        }
        return {}; // Return an empty object if conditions are not met
    };

    useEffect(() => {
        if (dialogType === DialogType.EDIT) {
            const entry: WaterDataEntry | {} = getWaterDataObject();
            if (entry) { setCurrentWaterData(entry); }
        }
    }, [dialogType, currentDate, waterData]); // Dependencies to re-run the effect

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
        const [year, month] = currentDate.split('-');
        const formattedMonth = `${year}-${month}`;
        const waterDataForMonth = waterData?.[formattedMonth] || [];

        setShowError(false);
        setErrorString(null);

        const existingEntry = waterDataForMonth.find(
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
            setLoading(true);

            try {
                let waterDate = new Date(currentDate);
                waterDate.setHours(new Date().getHours(), new Date().getMinutes(), new Date().getSeconds(), new Date().getMilliseconds());

                if (dialogType !== DialogType.EDIT) {
                    let addWater: WaterDataEntry = { user_id: auth.currentUser.uid, date: waterDate, intake_amount: calculateIntakeAmount(), waterType: WaterTypeEnum.MILLILITRES }
                    dispatch(addWaterData({ addWater, currentDate }))
                }
                if (dialogType === DialogType.EDIT && isWaterDataEntry(currentWaterData)) {
                    let updateWater: WaterDataEntry = { ...currentWaterData, intake_amount: Number(currentWaterData.intake_amount) + Number(calculateIntakeAmount()) }
                    dispatch(updateWaterData({ updateWater, currentDate }))
                }

                // Resetting Fields.
                setWater("");
                setIsWaterTypeFocus(false);
                setWaterType(WaterTypeEnum.MILLILITRES);
                setLoading(false);
                dispatch(clearImageURI());
                // Resetting Fields.

                dispatch(setDialog({ showDialog: false, dialogTab: null, dialogType: null }))
            }
            catch (error) {
                setLoading(false);
            } finally { setLoading(false); }
        }
        else { router.push({ pathname: "/register" }); }
    }

    return (
        <View style={styles.container}>
            {currentWaterData && Object.keys(currentWaterData).length > 0 && 'intake_amount' in currentWaterData && 'waterType' in currentWaterData && (
                <Surface style={styles.currentIntakeCard} elevation={2}>
                    <Text variant="bodyLarge" style={styles.intakeText}>
                        Congratulations! You have consumed {currentWaterData.intake_amount} {currentWaterData.waterType.charAt(0).toUpperCase() + currentWaterData.waterType.slice(1)} of water today.
                    </Text>
                    <Text variant="bodyMedium" style={styles.addMoreText}>Would you like to add more?</Text>
                </Surface>
            )}

            <View style={styles.trackWaterForm}>
                <Surface style={styles.inputContainer} elevation={3}>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            placeholder="Add Water"
                            value={water}
                            onChangeText={setWater}
                            autoCorrect={false}
                            autoCapitalize="none"
                            keyboardType="numeric"
                            maxLength={4}
                            editable={!loading}
                            mode="flat"
                        />
                        
                        <Dropdown 
                            style={[styles.dropdown, isWaterTypeFocus && { borderColor: "#6200ee" }]}
                            placeholderStyle={styles.placeholderStyle}
                            selectedTextStyle={styles.selectedTextStyle}
                            iconStyle={styles.iconStyle}
                            data={waterTypeOptions}
                            maxHeight={300}
                            labelField="label"
                            valueField="value"
                            placeholder={!isWaterTypeFocus ? "Select Unit" : "..."}
                            value={waterType}
                            onFocus={() => setIsWaterTypeFocus(true)}
                            onBlur={() => setIsWaterTypeFocus(false)}
                            onChange={(item: any) => {
                                setWaterType(item.value as WaterTypeEnum);
                                setIsWaterTypeFocus(false);
                            }}
                            renderRightIcon={() => (
                                <AntDesign 
                                    style={styles.icon} 
                                    color={isWaterTypeFocus ? "#6200ee" : "#666"} 
                                    name="Safety" 
                                    size={18} 
                                />
                            )}
                            disable={loading}
                        />
                    </View>
                </Surface>
            </View>

            <View style={styles.formSubmission}>
                <Button 
                    mode="text" 
                    onPress={() => { 
                        dispatch(setDialog({ showDialog: false, dialogTab: null, dialogType: null }));
                        dispatch(clearImageURI());
                    }} 
                    disabled={loading}
                    style={styles.button}
                >
                    Cancel
                </Button>
                <Button 
                    mode="contained" 
                    onPress={onSubmit} 
                    disabled={loading || !water} 
                    loading={loading}
                    style={styles.button}
                >
                    {dialogType === DialogType.EDIT ? 'Update' : 'Submit'}
                </Button>
            </View>

            {showError && <HelperText type="error" visible={showError} style={styles.errorText}>{errorString}</HelperText>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    currentIntakeCard: {
        padding: 12,
        marginBottom: 16,
        borderRadius: 12,
        backgroundColor: '#fff'
    },
    intakeText: {
        textAlign: 'center',
        marginBottom: 4,
        color: '#1a1a1a'
    },
    addMoreText: {
        textAlign: 'center',
        color: '#666'
    },
    trackWaterForm: {
        marginBottom: 16
    },
    inputContainer: {
        borderRadius: 12,
        backgroundColor: '#fff',
        padding: 8
    },
    inputWrapper: {
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
    formSubmission: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12
    },
    button: {
        borderRadius: 8,
        minWidth: 100
    },
    errorText: {
        textAlign: 'center',
        marginTop: 8
    }
})