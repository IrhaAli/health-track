import React from "react";
import { Pressable, View, Text } from "react-native";
import Dialog from "react-native-dialog";
import { Dropdown } from "react-native-element-dropdown";
import AntDesign from "@expo/vector-icons/AntDesign";
import TrackSleepForm from "./trackSleepForm";
import TrackWaterForm from "./trackWaterForm";

interface TrackFormsProps {
    currentDate: string;
    userId: string;
    formTab: string;
    hideDialog: () => void;
}

export default function TrackForms({ currentDate, userId, formTab, hideDialog }: TrackFormsProps) {
    return (
        <View>

            {formTab === "sleep" && (
                <TrackSleepForm currentDate={currentDate} userId={userId} onCancel={hideDialog}></TrackSleepForm>
            )}
            {formTab === "diet" && (
                <>
                    {!imageFoodUri ? (
                        <Pressable
                            style={styles.button}
                            onPress={() => {
                                setShowCamera(true);
                                setVisible(false);
                            }}
                        >
                            <Text style={styles.buttonText}>Add Picture</Text>
                        </Pressable>
                    ) : (
                        <>
                            <Image
                                source={{
                                    uri: imageFoodUri,
                                }}
                                width={100}
                                height={200}
                                resizeMode="contain"
                            />
                            <Pressable
                                onPress={() => {
                                    setImageFoodUri(null);
                                }}
                            >
                                <Text style={styles.buttonText}>X</Text>
                            </Pressable>
                        </>
                    )}
                    <Text>Time of Meal</Text>
                    <DateTimePicker
                        mode="time"
                        value={mealTime}
                        onChange={(event: any, value: Date | undefined) =>
                            setMealTime(value || new Date(currentDate))
                        }
                    />
                </>
            )}
            {formTab === "water" && (
                <TrackWaterForm currentDate={currentDate} userId={userId} onCancel={hideDialog}></TrackWaterForm>
            )}
            {formTab === "weight" && (
                <>
                    <Dialog.Input
                        style={styles.input}
                        placeholder="Add weight here..."
                        value={weight}
                        onChangeText={setWeight}
                        autoCorrect={false}
                        autoCapitalize="none"
                    />
                    <Dropdown
                        style={[
                            styles.dropdown,
                            isWeightTypeFocus && { borderColor: "blue" },
                        ]}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        iconStyle={styles.iconStyle}
                        data={weightTypeOptions}
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        placeholder={
                            !isWeightTypeFocus ? "Select Weight Unit" : "..."
                        }
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
                                setShowCamera(true);
                                setVisible(false);
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
                </>
            )}</View>
    )
}