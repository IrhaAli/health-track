import { RootState } from "@/store/store";
import { WeightDataEntry, WeightDataState } from "@/types/track";
import React from "react";
import { useSelector } from "react-redux";
import { Divider, Text } from "react-native-paper";
import { Image, View, ScrollView, StyleSheet } from "react-native";

export default function AppMediaWeightComponent() {
  const currentMonth = useSelector((state: RootState) => state.track.currentMonth);
  const weightData: WeightDataState | [] = useSelector((state: RootState) => state.track.weightData);
  const formattedMonth: string = String(`${currentMonth.year}-${currentMonth.month}`);

  if (!Array.isArray(weightData)) {
    if (formattedMonth in weightData) {
      if (weightData[formattedMonth] && weightData[formattedMonth].length > 0) {
        // Sort the array by date in descending order
        const sortedData = [...weightData[formattedMonth]].sort((a: WeightDataEntry, b: WeightDataEntry) => {
          const dateA = typeof a.date === 'string' ? new Date(a.date) : a.date;
          const dateB = typeof b.date === 'string' ? new Date(b.date) : b.date;
          return dateB.getTime() - dateA.getTime();
        });

        // Combine objects with the same date
        const combinedData = sortedData.reduce((acc, current) => {
          const dateKey = current.date instanceof Date
            ? current.date.toISOString().split('T')[0] // Convert Date to 'YYYY-MM-DD' string
            : current.date.split('T')[0] // Convert string to 'YYYY-MM-DD' string;
          if (!acc[dateKey]) {
            acc[dateKey] = { date: dateKey, data: [] };
          }
          acc[dateKey].data.push(current);
          return acc;
        }, {} as Record<string, { date: string; data: WeightDataEntry[] }>);

        // Convert the combined data object back to an array
        const finalData = Object.values(combinedData);

        return (
          <ScrollView>
            {finalData.map((item: { date: string | Date; data: WeightDataEntry[] }, i) => {
              const formattedDate: string = typeof item.date === 'string' ? new Date(item.date).toLocaleDateString() : item.date.toLocaleDateString();

              return (
                <View key={i}>
                  <Text variant="titleLarge" style={[{ fontWeight: 600 }]}>{formattedDate}</Text>
                  <View style={styles.imagesParent}>{item.data.map((weight: WeightDataEntry, ind) => (
                    <Image key={ind} style={styles.image} source={{ uri: weight.picture }} />
                  ))}</View>
                  <Divider style={[{ marginBottom: 10 }]}/>
                </View>
              );
            })}
          </ScrollView>
        )
      } else return <></>
    } else return <></>
  } else return <></>
}

const styles = StyleSheet.create({
  imagesParent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  }, 
  image: {
    width: 125,
    height: 200,
    resizeMode: 'contain',
    margin: 5,
  },
})