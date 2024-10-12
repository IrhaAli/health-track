import React from "react";
import { Card, Button, Text, Avatar } from 'react-native-paper';
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/firebaseConfig";

interface WaterDataEntry {
    id: string;
    date: string;
    intake_amount: number;
    user_id: string;
    waterType: string;
}

type WaterDataState = {
    [key: string]: WaterDataEntry[];
};

export default function TrackWaterCard() {
    const currentMonth = useSelector((state: RootState) => state.track.currentMonth);
    const LeftContent = (props: any) => <Avatar.Icon {...props} icon="glass-pint-outline" />
    const waterData: WaterDataState | [] = useSelector((state: RootState) => state.track.waterData);
    const currentDate: string = useSelector((state: RootState) => state.track.currentDate);
    const formattedMonth: string = String(`${currentMonth.year}-${currentMonth.month}`);

    const deleteWaterRecords = async(docId: string) => {
        try {
            await deleteDoc(doc(db, "water_tracking", docId));
        }
        catch (error) {
            console.log('error', error);
        }
    }

    if (!Array.isArray(waterData)) {
        if (formattedMonth in waterData) {
            if (waterData[formattedMonth] && waterData[formattedMonth].length > 0) {
                {
                    return waterData[formattedMonth]
                        .filter(entry => new Date(entry.date).toISOString().split('T')[0] === currentDate)
                        .map((water: WaterDataEntry, index: number) => (
                            <Card key={index} style={{ margin: 10 }}>
                                <Card.Title
                                    title={`Date: ${new Date(water.date).toLocaleDateString()}`}
                                    subtitle={`User ID: ${water.user_id}`}
                                    left={LeftContent}
                                />
                                <Card.Content>
                                    <Text variant="titleLarge">
                                        Intake Amount: {water.intake_amount} {water.waterType}
                                    </Text>
                                </Card.Content>
                                <Card.Actions>
                                    <Button icon="delete" onPress={() => { deleteWaterRecords(water.id); }}>Delete</Button>
                                    <Button icon="pencil">Edit</Button>
                                </Card.Actions>
                            </Card>
                        ))
                }
            }
        }
    }

    return (<></>);
}