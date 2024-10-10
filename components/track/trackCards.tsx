import React from "react";
import { ScrollView } from "react-native";

// Local Components Start.
import TrackWaterCard from "./trackWaterCard";
// Local Components End.

export default function TrackCards() {
    return (
        <ScrollView>
            <TrackWaterCard></TrackWaterCard>
            {/* <Divider style={[{ marginVertical: 10 }]} /> */}
        </ScrollView>
    );
}
