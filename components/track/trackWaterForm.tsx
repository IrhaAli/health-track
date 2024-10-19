import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Dialog from "react-native-dialog";
import { Dropdown } from "react-native-element-dropdown";
import AntDesign from "@expo/vector-icons/AntDesign";
import { router } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { DialogType, setDialog } from "@/store/trackDialogSlice";
import { AppDispatch, RootState } from "@/store/store";
import { Divider, Button, HelperText, Text } from 'react-native-paper';
import { getAuth } from "firebase/auth";
import { addWaterData, updateWaterData } from "@/store/trackSlice";
import { WaterDataEntry, WaterDataState } from "@/types/track";
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

    function isWaterDataEntry(obj: any): obj is WaterDataEntry {
        return (
          obj &&
          typeof obj === 'object' &&
          'intake_amount' in obj &&
          'waterType' in obj &&
          'id' in obj &&
          'date' in obj &&
          'user_id' in obj
        );
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
        <View>
            {currentWaterData &&  Object.keys(currentWaterData).length > 0 && 'intake_amount' in currentWaterData && 'waterType' in currentWaterData && <View>
                <Text variant="bodyLarge">{`Congratulations! You have consumed ${currentWaterData.intake_amount} ${currentWaterData.waterType.charAt(0).toUpperCase() + currentWaterData.waterType.slice(1)} of water today.\nDo you like to add more?`}</Text>
            </View>}
            <View style={styles.trackWaterForm}>
                <Dialog.Input
                    style={[styles.input]}
                    placeholder="Add Water"
                    value={water}
                    onChangeText={setWater}
                    autoCorrect={false}
                    autoCapitalize="none"
                    keyboardType="numeric"
                    maxLength={4}
                    underlineColorAndroid={'transparent'}
                    editable={!loading}
                ></Dialog.Input>
                <Dropdown style={[styles.dropdown, isWaterTypeFocus && { borderColor: "blue" }]}
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
                    renderRightIcon={() => (<AntDesign style={styles.icon} color={isWaterTypeFocus ? "blue" : "black"} name="Safety" size={20} />)}
                    disable={loading}
                />
            </View>

            <Divider />
            <View style={styles.formSubmission}>
                <Button mode="text" onPress={() => { dispatch(setDialog({ showDialog: false, dialogTab: null, dialogType: null })); dispatch(clearImageURI()); }} disabled={loading} textColor="blue">Cancel</Button>
                <Button mode="contained" onPress={onSubmit} disabled={loading || !water} loading={loading}>{dialogType === DialogType.EDIT ? 'Update' : 'Submit'}</Button>
            </View>

            {showError && <HelperText type="error" visible={showError}>{errorString}</HelperText>}
        </View>
    );
}

const styles = StyleSheet.create({
    trackWaterForm: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 10,
    },
    input: {
        paddingBottom: 0,
        paddingTop: 0,
        paddingRight: 100,
        paddingLeft: 20,
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
        width: '100%'
    },
    icon: {
        marginRight: 5,
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
        borderLeftWidth: 0,
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