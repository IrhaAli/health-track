import React from "react";
import { Card, Button, Text, Avatar } from 'react-native-paper';
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { deleteWaterData } from "@/store/trackSlice";
import { WaterDataEntry, WaterDataState } from "../../types/track";

export default function TrackWaterCard() {
    const currentMonth = useSelector((state: RootState) => state.track.currentMonth);
    const LeftContent = (props: any) => <Avatar.Icon {...props} icon="glass-pint-outline" />
    const waterData: WaterDataState | [] = useSelector((state: RootState) => state.track.waterData);
    const currentDate: string = useSelector((state: RootState) => state.track.currentDate);
    const formattedMonth: string = String(`${currentMonth.year}-${currentMonth.month}`);
    const dispatch = useDispatch<AppDispatch>();

    const deleteWaterRecords = async (docId?: string) => {
        if (docId) { dispatch(deleteWaterData({ currentDate: currentDate, docId: docId })) }
    }

    if (!Array.isArray(waterData)) {
        if (formattedMonth in waterData) {
            if (waterData[formattedMonth] && waterData[formattedMonth].length > 0) {
                {
                    return waterData[formattedMonth]
                        .filter((entry: WaterDataEntry) => new Date(entry.date).toLocaleDateString().split('/').reverse().join('-') === currentDate)
                        .map((water: WaterDataEntry, index: number) => (
                            <Card key={index} style={{ margin: 10 }}>
                                <Card.Title
                                    title={`Total Water Consumed: ${water.intake_amount} ${water.waterType}`}
                                    left={LeftContent}
                                />
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