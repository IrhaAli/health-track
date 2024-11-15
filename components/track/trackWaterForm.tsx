import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import AntDesign from "@expo/vector-icons/AntDesign";
import { router } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { DialogType, setDialog } from "@/store/trackDialogSlice";
import { AppDispatch, RootState } from "@/store/store";
import { Divider, Button, HelperText, Text, Surface, TextInput } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addWaterData, updateWaterData } from "@/store/trackSlice";
import { WaterDataEntry, WaterDataState, isWaterDataEntry } from "@/types/track";
import { clearImageURI } from "@/store/cameraSlice";

const WaterTypeEnum = {
    MILLILITRES: "millilitres",
    LITRES: "litres",
    CUPS: "cups"
} as const;

export default function TrackWaterForm() {
    const dispatch = useDispatch<AppDispatch>();
    const { currentDate, waterData } = useSelector((state: RootState) => state.track);
    const dialogType = useSelector((state: RootState) => state.trackDialog.dialogType);

    const [formState, setFormState] = useState({
        water: "",
        waterType: WaterTypeEnum.MILLILITRES,
        isWaterTypeFocus: false,
        loading: false,
        error: { show: false, message: null },
        currentUser: null,
        currentWaterData: {}
    });

    const waterTypeOptions = Object.values(WaterTypeEnum).map(type => ({
        label: type.charAt(0).toUpperCase() + type.slice(1),
        value: type
    }));

    useEffect(() => {
        AsyncStorage.getItem('session').then(userString => {
            if (userString) setFormState(prev => ({ ...prev, currentUser: JSON.parse(userString) }));
        });
    }, []);

    useEffect(() => {
        if (dialogType === DialogType.EDIT) {
            const [year, month] = currentDate.split('-');
            const entry = waterData[`${year}-${month}`]?.find((entry: WaterDataEntry) => 
                new Date(entry.date).toLocaleDateString().split('/').reverse().join('-') === currentDate
            );
            if (entry) setFormState(prev => ({ ...prev, currentWaterData: entry }));
        }
    }, [dialogType, currentDate, waterData]);

    const calculateIntakeAmount = () => {
        const rates = { cups: 250, litres: 1000, millilitres: 1 };
        return parseFloat(formState.water) * rates[formState.waterType];
    };

    const handleSubmit = async () => {
        const { currentUser, currentWaterData } = formState;
        if (!currentUser || !(currentUser as any).uid) {
            router.push({ pathname: "/register" });
            return;
        }

        setFormState(prev => ({ ...prev, loading: true, error: { show: false, message: null } }));

        try {
            const waterDate = new Date(currentDate);
            waterDate.setHours(new Date().getHours(), new Date().getMinutes());

            if (dialogType !== DialogType.EDIT) {
                dispatch(addWaterData({
                    addWater: {
                        user_id: (currentUser as any).uid,
                        date: waterDate,
                        intake_amount: calculateIntakeAmount(),
                        waterType: WaterTypeEnum.MILLILITRES
                    },
                    currentDate
                }));
            } else if (isWaterDataEntry(currentWaterData)) {
                dispatch(updateWaterData({
                    updateWater: {
                        ...currentWaterData,
                        intake_amount: Number(currentWaterData.intake_amount) + calculateIntakeAmount()
                    },
                    currentDate
                }));
            }

            dispatch(setDialog({ showDialog: false, dialogTab: null, dialogType: null }));
            dispatch(clearImageURI());
            
            setFormState(prev => ({
                ...prev,
                water: "",
                waterType: WaterTypeEnum.MILLILITRES,
                isWaterTypeFocus: false,
                loading: false,
                error: { show: false, message: null }
            }));
        } catch (error) {
            setFormState(prev => ({ 
                ...prev, 
                loading: false,
                error: { show: true, message: null }
            }));
        }
    };

    return (
        <View style={styles.container}>
            {isWaterDataEntry(formState.currentWaterData) && (
                <Surface style={styles.currentIntakeCard} elevation={2}>
                    <Text variant="bodyLarge" style={styles.intakeText}>
                        {`Consumed ${formState.currentWaterData.intake_amount} ${formState.currentWaterData.waterType} today`}
                    </Text>
                    <Text variant="bodyMedium" style={styles.addMoreText}>Add more?</Text>
                </Surface>
            )}

            <Surface style={[styles.inputContainer, { marginBottom: 16 }]} elevation={3}>
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.input}
                        placeholder="Add Water"
                        value={formState.water}
                        onChangeText={water => setFormState(prev => ({ ...prev, water }))}
                        keyboardType="numeric"
                        maxLength={4}
                        editable={!formState.loading}
                        mode="flat"
                    />
                    
                    <Dropdown 
                        style={[styles.dropdown, formState.isWaterTypeFocus && { borderColor: "#6200ee" }]}
                        data={waterTypeOptions}
                        labelField="label"
                        valueField="value"
                        value={formState.waterType}
                        onChange={item => setFormState(prev => ({ 
                            ...prev, 
                            waterType: item.value as "millilitres",
                            isWaterTypeFocus: false
                        }))}
                        disable={formState.loading}
                    />
                </View>
            </Surface>

            <Divider style={{ marginBottom: 16 }} />

            <View style={styles.formSubmission}>
                <Button 
                    mode="text" 
                    onPress={() => dispatch(setDialog({ showDialog: false, dialogTab: null, dialogType: null }))}
                    disabled={formState.loading}
                >
                    Cancel
                </Button>
                <Button 
                    mode="contained" 
                    onPress={handleSubmit}
                    disabled={formState.loading || !formState.water}
                    loading={formState.loading}
                >
                    {dialogType === DialogType.EDIT ? 'Update' : 'Submit'}
                </Button>
            </View>

            {formState.error.show && (
                <HelperText type="error" visible={true} style={styles.errorText}>
                    {formState.error.message}
                </HelperText>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16 },
    currentIntakeCard: {
        padding: 12,
        marginBottom: 16,
        borderRadius: 12,
        backgroundColor: '#fff'
    },
    intakeText: { textAlign: 'center', marginBottom: 4, color: '#1a1a1a' },
    addMoreText: { textAlign: 'center', color: '#666' },
    inputContainer: { borderRadius: 12, backgroundColor: '#fff', padding: 8 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    input: { flex: 1, height: 44, backgroundColor: 'transparent', fontSize: 16 },
    dropdown: {
        width: 120,
        height: 44,
        borderRadius: 8,
        paddingHorizontal: 8,
        backgroundColor: '#f5f5f5'
    },
    formSubmission: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
    errorText: { textAlign: 'center', marginTop: 8 }
});