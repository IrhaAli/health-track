import React from "react";
import { Card, Button, Avatar, Divider } from 'react-native-paper';
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { deleteWeightData } from "@/store/trackSlice";
import { WeightDataEntry, WeightDataState } from "../../types/track";
import { Image, View } from "react-native";
import { setDialog, DialogTab, DialogType } from "@/store/trackDialogSlice";

export default function TrackWeightCard() {
    const currentMonth = useSelector((state: RootState) => state.track.currentMonth);
    const LeftContent = (props: any) => <Avatar.Icon {...props} icon="weight" color="#fff" />
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
                        .filter((entry: WeightDataEntry) => new Date(entry.date).toLocaleDateString().split('/').reverse().join('-') === currentDate)
                        .map((weight: WeightDataEntry, index: number) => (
                            <View key={index}>
                                <Divider />
                                <Card style={[{ margin: 10 }]}>
                                    <Card.Title title={`Weight: ${weight.weight} ${weight.measurement_unit}`} left={LeftContent} />
                                    <Card.Content>
                                        <Image
                                            style={[{ width: 100, height: 150, objectFit: 'contain', alignSelf: 'center' }]}
                                            source={{ uri: weight.picture }}
                                        />
                                    </Card.Content>
                                    <Card.Actions style={[{ alignSelf: 'flex-start' }]}>
                                        <Button icon="delete" onPress={() => { deleteWeightRecords(weight.id); }}>Delete</Button>
                                        <Button icon="pencil" onPress={() => dispatch(setDialog({ showDialog: true, dialogTab: DialogTab.WEIGHT, dialogType: DialogType.EDIT }))}>Edit</Button>
                                    </Card.Actions>
                                </Card>
                            </View>
                        ))
                }
            }
        }
    }

    return (<></>);
}