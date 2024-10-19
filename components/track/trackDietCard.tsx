import React from "react";
import { Card, Button, Text, Avatar, Divider } from 'react-native-paper';
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { DietDataEntry, DietDataState } from "../../types/track";
import { deleteDietData } from "@/store/trackSlice";
import { Image, View } from "react-native";
import { setDialog, DialogTab, DialogType } from "@/store/trackDialogSlice";

export default function TrackDietCard() {
    const currentMonth = useSelector((state: RootState) => state.track.currentMonth);
    const LeftContent = (props: any) => <Avatar.Icon {...props} icon="food" color="#fff" />
    const dietData: DietDataState | [] = useSelector((state: RootState) => state.track.dietData);
    const currentDate: string = useSelector((state: RootState) => state.track.currentDate);
    const formattedMonth: string = String(`${currentMonth.year}-${currentMonth.month}`);
    const dispatch = useDispatch<AppDispatch>();

    const deleteDietRecords = async (docId?: string) => {
        if (docId) { dispatch(deleteDietData({ currentDate: currentDate, docId: docId })) }
    }

    if (!Array.isArray(dietData)) {
        if (formattedMonth in dietData) {
            if (dietData[formattedMonth] && dietData[formattedMonth].length > 0) {
                {
                    return dietData[formattedMonth]
                        .filter((entry: DietDataEntry) => new Date(entry.date).toLocaleDateString().split('/').reverse().join('-') === currentDate)
                        .map((diet: DietDataEntry, index: number) => (
                            <View key={index}>
                                <Divider />
                                <Card style={{ margin: 10 }}>
                                    <Card.Title title={`Meal at: ${new Date(diet.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`} left={LeftContent} />
                                    <Card.Content>
                                        <Image
                                            style={[{ width: 100, height: 150, objectFit: 'contain', alignSelf: 'center' }]}
                                            source={{ uri: diet.meal_picture }}
                                        />
                                    </Card.Content>
                                    <Card.Actions style={[{ alignSelf: 'flex-start' }]}>
                                        <Button icon="delete" onPress={() => deleteDietRecords(diet.id) }>Delete</Button>
                                        <Button icon="pencil" onPress={() => dispatch(setDialog({ showDialog: true, dialogTab: DialogTab.DIET, dialogType: DialogType.EDIT }))}>Edit</Button>
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