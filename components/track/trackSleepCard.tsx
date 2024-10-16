import React from "react";
import { Card, Button, Text, Avatar } from 'react-native-paper';
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { SleepDataEntry, SleepDataState } from "../../types/track";
import { deleteSleepData } from "@/store/trackSlice";

export default function TrackSleepCard() {
    const currentMonth = useSelector((state: RootState) => state.track.currentMonth);
    const LeftContent = (props: any) => <Avatar.Icon {...props} icon="moon-waning-crescent" />
    const sleepData: SleepDataState | [] = useSelector((state: RootState) => state.track.sleepData);
    const currentDate: string = useSelector((state: RootState) => state.track.currentDate);
    const formattedMonth: string = String(`${currentMonth.year}-${currentMonth.month}`);
    const dispatch = useDispatch<AppDispatch>();

    const deleteSleepRecords = async (docId?: string) => {
        console.log('docId in deleteSleepRecords', docId);
        if (docId) { dispatch(deleteSleepData({ currentDate: currentDate, docId: docId })) }
    }

    const convertMinutesToHoursAndMinutes = (totalMinutes: number): string =>
        `${Math.floor(totalMinutes / 60)} hours and ${totalMinutes % 60} minutes`;

    if (!Array.isArray(sleepData)) {
        if (formattedMonth in sleepData) {
            if (sleepData[formattedMonth] && sleepData[formattedMonth].length > 0) {
                {
                    return sleepData[formattedMonth]
                        .filter((entry: SleepDataEntry) => new Date(entry.wakeup_time).toLocaleDateString().split('/').reverse().join('-') === currentDate)
                        .map((sleep: SleepDataEntry, index: number) => (
                            <Card key={index} style={{ margin: 10 }}>
                                <Card.Title
                                    title={`Sleep Duration: ${convertMinutesToHoursAndMinutes(sleep.sleep_duration)}`}
                                    subtitle={`Sleep Quality: ${sleep.sleep_quality}/5`}
                                    left={LeftContent}
                                />
                                <Card.Actions>
                                    <Button icon="delete" onPress={() => { deleteSleepRecords(sleep.id); }}>Delete</Button>
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