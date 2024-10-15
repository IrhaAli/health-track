import React from "react";
import { Card, Button, Text, Avatar } from 'react-native-paper';
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
// import { deleteWaterData } from "@/store/trackSlice";
import { SleepDataEntry, SleepDataState } from "../../types/track";

export default function TrackSleepCard() {
    const currentMonth = useSelector((state: RootState) => state.track.currentMonth);
    const LeftContent = (props: any) => <Avatar.Icon {...props} icon="moon-waning-crescent" />
    const sleepData: SleepDataState | [] = useSelector((state: RootState) => state.track.sleepData);
    const currentDate: string = useSelector((state: RootState) => state.track.currentDate);
    const formattedMonth: string = String(`${currentMonth.year}-${currentMonth.month}`);
    const dispatch = useDispatch<AppDispatch>();

    // const deleteSleepRecords = async (docId?: string) => {
    //     if (docId) { dispatch(deleteSleepData({ currentDate: currentDate, docId: docId })) }
    // }

    if (!Array.isArray(sleepData)) {
        if (formattedMonth in sleepData) {
            if (sleepData[formattedMonth] && sleepData[formattedMonth].length > 0) {
                {
                    return sleepData[formattedMonth]
                        .filter(entry => new Date(entry.wakeup_time).toLocaleDateString().split('/').reverse().join('-') === currentDate)
                        .map((sleep: SleepDataEntry, index: number) => (
                            <Card key={index} style={{ margin: 10 }}>
                                <Card.Title
                                    title={`Date: ${new Date(sleep.wakeup_time).toLocaleDateString()}`}
                                    subtitle={`User ID: ${sleep.user_id}`}
                                    left={LeftContent}
                                />
                                <Card.Content>
                                    <Text variant="titleLarge">
                                        Sleep Duration: {sleep.sleep_duration}
                                    </Text>
                                    <Text variant="titleLarge">
                                        Sleep Quality: {sleep.sleep_quality}
                                    </Text>
                                </Card.Content>
                                <Card.Actions>
                                    {/* <Button icon="delete" onPress={() => { deleteWaterRecords(water.id); }}>Delete</Button> */}
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