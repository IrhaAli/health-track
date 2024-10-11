import React, { useEffect, useState } from "react";
import { Card, Button, Text, Avatar } from 'react-native-paper';
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { pushWaterData } from "@/store/trackSlice";
import { getAuth } from "firebase/auth";
import { useSession } from "@/ctx";

interface WaterDataEntry {
    date: string;
    intake_amount: number;
    user_id: string;
    waterType: string;
}

type WaterDataState = {
    [key: string]: WaterDataEntry[];
};

export default function TrackWaterCard() {
    const userId = useSelector((state: RootState) => state.user.userId);
    const currentMonth = useSelector((state: RootState) => state.track.currentMonth);
    const LeftContent = (props: any) => <Avatar.Icon {...props} icon="glass-pint-outline" />
    const dispatch = useDispatch();
    const allWaterData: WaterDataState | [] = useSelector((state: RootState) => state.track.waterData);
    const [waterData, setWaterData] = useState(null);
    const auth = getAuth();

    const { session } = useSession();
    const user = auth.currentUser;
    const formattedMonth: string = `${currentMonth.year}-${currentMonth.month}`; 

    console.log('user?.uid', user?.uid);

    if (user?.uid && currentMonth.month && currentMonth.year) {
        const loadData = async () => {
            try {
                console.log('loadData calls');
                console.log('all water data', allWaterData);

                if (!(formattedMonth in allWaterData)) {
                    const firstDate = new Date(Date.UTC(parseInt(currentMonth.year, 10), parseInt(currentMonth.month, 10) - 1, 1));
                    const lastDate = new Date(Date.UTC(parseInt(currentMonth.year, 10), parseInt(currentMonth.month, 10), 0, 23, 59, 59, 999));
    
                    const collectionData = query(
                        collection(db, "water_tracking"),
                        where("date", ">=", firstDate),
                        where("date", "<=", lastDate),
                        where("user_id", "==", session)
                    );
                    const docSnap = await getDocs(collectionData);
                    const docData: WaterDataEntry[] = [];
    
                    // console.log('loadData running.');
                    // console.log('docSnap', docSnap);
    
                    docSnap.forEach((item) => {
                        const data = item.data();
                        const entry: WaterDataEntry = {
                            date: String(data.date.toDate()),
                            intake_amount: data.intake_amount,
                            user_id: data.user_id,
                            waterType: data.waterType
                        };
                        docData.push(entry);
                    });
    
                    console.log('docData', docData);
    
                    console.log({ [formattedMonth]: docData });
    
                    dispatch(pushWaterData({ [formattedMonth]: docData }));
                }
            }
            catch (error: any) {
                console.log('error in fetchWater', error);
                console.log('errro.message', error.message);
            }

        }
        loadData();
    }

    console.log('formattedMonth', formattedMonth);

    console.log(allWaterData[formattedMonth]);

    if (!(formattedMonth in allWaterData) || (allWaterData[formattedMonth].length < 1)) { return <></> }

    return (
        <Card style={[{ marginHorizontal: 10 }]}>
            <Card.Title title="Card Title" subtitle="Card Subtitle" left={LeftContent} />
            <Card.Content>
                <Text variant="titleLarge">Card title</Text>
                <Text variant="bodyMedium">Card content</Text>
            </Card.Content>
            <Card.Actions>
                <Button icon="delete">Delete</Button>
                <Button icon="pencil">Edit</Button>
            </Card.Actions>
        </Card>
    );
}