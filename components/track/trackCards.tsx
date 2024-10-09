import React from "react";
import { getAuth } from "firebase/auth";
import { Divider } from 'react-native-paper';
import { ScrollView } from "react-native";

// Local Components Start.
import TrackWaterCard from "./trackWaterCard";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { last } from "lodash";
import { ColorSpace } from "react-native-reanimated";
// Local Components End.

export default function TrackCards() {
    const userId = useSelector((state: RootState) => state.user.userId);
    const currentMonth = useSelector((state: RootState) => state.track.currentMonth);
    
    console.log('userId', userId);
    console.log('currentMonth', currentMonth);
    if(userId && currentMonth.month && currentMonth.year) {
        const firstDate = new Date(Date.UTC(parseInt(currentMonth.year, 10), parseInt(currentMonth.month, 10) - 1, 1));
        const lastDate = new Date(Date.UTC(parseInt(currentMonth.year, 10), parseInt(currentMonth.month, 10), 0, 23, 59, 59, 999));
        


        console.log('firstDate', firstDate.toISOString());
        console.log('lastDate', lastDate.toISOString());

        const loadDate = async () => {
            console.log('function called');
            const collectionData = query(
                collection(db, "diet_tracking"),
                where("user_id", "==", userId),
                where("date", ">=", firstDate),
                where("date", "<=", lastDate)
            );
            const docSnap = await getDocs(collectionData);
            const docData: any[] = [];
            docSnap.forEach((item) => docData.push({ ...item.data() }));

            console.log('docData', docData);
        }
        loadDate();
    }



        
    

    return (
        <ScrollView>
            <TrackWaterCard></TrackWaterCard>
            <TrackWaterCard></TrackWaterCard>
            <TrackWaterCard></TrackWaterCard>
            <TrackWaterCard></TrackWaterCard>
            <TrackWaterCard></TrackWaterCard>
            <TrackWaterCard></TrackWaterCard>
            {/* <Divider style={[{ marginVertical: 10 }]} /> */}
        </ScrollView>
    );
}
