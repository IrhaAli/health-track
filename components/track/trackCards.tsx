import { ScrollView } from "react-native";
import React from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { pushWaterData } from "@/store/trackSlice";
import { getAuth } from "firebase/auth";
import { useSession } from "@/ctx";

// Local Components Start.
import TrackWaterCard from "./trackWaterCard";
// Local Components End.

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

export default function TrackCards() {
    const currentMonth = useSelector((state: RootState) => state.track.currentMonth);
    const dispatch = useDispatch();
    const waterData: WaterDataState | [] = useSelector((state: RootState) => state.track.waterData);
    const auth = getAuth();

    const { session } = useSession();
    const user = auth.currentUser;
    const formattedMonth: string = String(`${currentMonth.year}-${currentMonth.month}`);

    const firstDate = new Date(Date.UTC(parseInt(currentMonth.year, 10), parseInt(currentMonth.month, 10) - 1, 1));
    const lastDate = new Date(Date.UTC(parseInt(currentMonth.year, 10), parseInt(currentMonth.month, 10), 0, 23, 59, 59, 999));

    const loadWaterData = async () => {
        try {
            if (!(formattedMonth in waterData)) {
                const collectionData = query(
                    collection(db, "water_tracking"),
                    where("date", ">=", firstDate),
                    where("date", "<=", lastDate),
                    where("user_id", "==", session)
                );
                const docSnap = await getDocs(collectionData);

                const docData = docSnap.docs.map(item => ({
                    id: item.id,
                    date: item.data().date.toDate().toISOString(),
                    intake_amount: item.data().intake_amount,
                    user_id: item.data().user_id,
                    waterType: item.data().waterType
                }));
                dispatch(pushWaterData({ [formattedMonth]: docData }));
            }
        }
        catch (error: any) { }
    }

    if (user?.uid && currentMonth.month && currentMonth.year) {
        loadWaterData();
    }

    return (
        <ScrollView>
            <TrackWaterCard></TrackWaterCard>
        </ScrollView>
    );
}
