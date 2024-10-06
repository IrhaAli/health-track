import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Dialog from "react-native-dialog";
import { Dropdown } from "react-native-element-dropdown";
import AntDesign from "@expo/vector-icons/AntDesign";

interface TrackSleepFormProps {
    currentDate: string;
}

enum WaterTypeEnum {
    MILLILITRES = "millilitres",
    LITRES = "litres",
    GALLONS = "gallons"
};

export default function TrackWaterForm({ currentDate }: TrackSleepFormProps) {
    const [water, setWater] = useState("");
    const [isWaterTypeFocus, setIsWaterTypeFocus] = useState(false);
    const [waterType, setWaterType] = useState(WaterTypeEnum.MILLILITRES);
    
    const waterTypeOptions = Object.values(WaterTypeEnum).map((type) => ({ label: type, value: type }));

    return (
        <View style={styles.trackWaterForm}>
           <Dialog.Input
                style={[ styles.input ]}
                placeholder="Add water here..."
                value={water}
                onChangeText={setWater}
                autoCorrect={false}
                autoCapitalize="none"
                keyboardType="numeric"
                maxLength={4}
            ></Dialog.Input>
           <Dropdown style={[ styles.dropdown, isWaterTypeFocus && { borderColor: "blue" }, styles.flexItem ]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                iconStyle={styles.iconStyle}
                data={waterTypeOptions}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={ !isWaterTypeFocus ? "Select Water Unit" : "..." }
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
            />
        </View>
    );
}

const styles = StyleSheet.create({
    trackWaterForm:  {
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
    }
})