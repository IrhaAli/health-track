import React from "react";
import { Card, Button, Text, Avatar } from 'react-native-paper';
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { deleteWeightData } from "@/store/trackSlice";
import { WeightDataEntry, WeightDataState } from "../../types/track";

export default function TrackWeightCard() {
    const currentMonth = useSelector((state: RootState) => state.track.currentMonth);
    const LeftContent = (props: any) => <Avatar.Icon {...props} icon="weight" />
    const weightData: WeightDataState | [] = useSelector((state: RootState) => state.track.weightData);
    const currentDate: string = useSelector((state: RootState) => state.track.currentDate);
    const formattedMonth: string = String(`${currentMonth.year}-${currentMonth.month}`);
    const dispatch = useDispatch<AppDispatch>();

    const deleteWeightRecords = async (docId?: string) => {
        if (docId) { dispatch(deleteWeightData({ currentDate: currentDate, docId: docId })) }
    }

    if (!Array.isArray(weightData)) {
        if (formattedMonth in weightData) {
            if (weightData[formattedMonth] && weightData[formattedMonth].length > 0) {
                {
                    return weightData[formattedMonth]
                        .filter(entry => new Date(entry.date).toLocaleDateString().split('/').reverse().join('-') === currentDate)
                        .map((weight: WeightDataEntry, index: number) => (
                            <Card key={index} style={{ margin: 10 }}>
                                <Card.Title
                                    title={`Date: ${new Date(weight.date).toLocaleDateString()}`}
                                    subtitle={`User ID: ${weight.user_id}`}
                                    left={LeftContent}
                                />
                                <Card.Content>
                                    <Text variant="titleLarge">
                                        Intake Amount: {weight.weight} {weight.measurement_unit}
                                    </Text>
                                </Card.Content>
                                <Card.Actions>
                                    <Button icon="delete" onPress={() => { deleteWeightRecords(weight.id); }}>Delete</Button>
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