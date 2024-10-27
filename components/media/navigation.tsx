import { RootState } from "@/store/store";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Avatar, Button, Text } from "react-native-paper";
import { View, StyleSheet } from "react-native";

export default function AppMediaNavitaionComponent() {
    const [disablePrevButton, setDisablePrevButton] = useState<boolean>(true);
    const [disableNextButton, setDisableNextButton] = useState<boolean>(true);
    const currentMonth = useSelector((state: RootState) => state.track.currentMonth);

    const getMonthName = (monthNumber: string) => {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        // Convert the month number string to an integer and adjust for zero-based index
        const index = parseInt(monthNumber, 10) - 1;

        // Check if the index is valid
        if (index >= 0 && index < monthNames.length) {
            return monthNames[index];
        } else {
            throw new Error('Invalid month number');
        }
    }

    const navNext = () => {
        
    }
    const navPrev = () => {}

    return (
        <View style={styles.navigationParent}>
            <Button icon={({ size, color }) => (<Avatar.Icon size={30} icon="chevron-left" color="#fff" />)} mode="text" onPress={navNext} disabled={disablePrevButton} style={[{  }]}>{''}</Button>
            <Text variant="titleLarge">{getMonthName(currentMonth.month)} {currentMonth.year}</Text>
            <Button icon={({ size, color }) => (<Avatar.Icon size={30} icon="chevron-right" color="#fff" />)} mode="text" onPress={navPrev} disabled={disableNextButton} style={[{  }]}>{''}</Button>
        </View>
    );
}

const styles = StyleSheet.create({
    navigationParent: {
        flexDirection: 'row', 
        marginTop: 43, 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingHorizontal: 30,
    },
})