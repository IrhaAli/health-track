import React from "react";
import { Pressable, View, Text, StyleSheet } from "react-native";
import Dialog from "react-native-dialog";
import { Dropdown } from "react-native-element-dropdown";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useDispatch } from "react-redux";
import { setHideDialog } from "@/store/trackDialogSlice";
import { setHideCamera } from "@/store/cameraSlice";

interface TrackFormsProps {
    currentDate: string;
    userId: string;
}

export default function TrackWeightForm({ currentDate, userId }: TrackFormsProps) {

    const dispatch = useDispatch();

    return (
        <View>
            <Dialog.Input
                style={styles.input}
                placeholder="Add weight here..."
                value={weight}
                onChangeText={setWeight}
                autoCorrect={false}
                autoCapitalize="none"
            />
            <Dropdown
                style={[ styles.dropdown, isWeightTypeFocus && { borderColor: "blue" } ]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                iconStyle={styles.iconStyle}
                data={weightTypeOptions}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={ !isWeightTypeFocus ? "Select Weight Unit" : "..." }
                value={weightType}
                onFocus={() => setIsWeightTypeFocus(true)}
                onBlur={() => setIsWeightTypeFocus(false)}
                onChange={(item: any) => {
                    setWeightType(item.value);
                    setIsWeightTypeFocus(false);
                }}
                renderLeftIcon={() => (
                    <AntDesign
                        style={styles.icon}
                        color={isWeightTypeFocus ? "blue" : "black"}
                        name="Safety"
                        size={20}
                    />
                )}
            />
            {!imageWeightUri ? (
                <Pressable
                    style={styles.button}
                    onPress={() => {
                        dispatch(setHideDialog());
                        dispatch(setHideCamera());
                    }}
                >
                    <Text style={styles.buttonText}>Add Picture</Text>
                </Pressable>
            ) : (
                <>
                    <Image
                        source={{
                            uri: imageWeightUri,
                        }}
                        width={100}
                        height={200}
                        resizeMode="contain"
                    />
                    <Pressable
                        onPress={() => {
                            setImageWeightUri(null);
                        }}
                    >
                        <Text style={styles.buttonText}>X</Text>
                    </Pressable>
                </>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    trackDietForm: {
        paddingVertical: 30,
        backgroundColor: 'white'
    },
})