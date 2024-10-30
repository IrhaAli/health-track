import { RootState } from "@/store/store";
import { DietDataEntry, DietDataState } from "@/types/track";
import React from "react";
import { useSelector } from "react-redux";
import { Divider, Text } from "react-native-paper";
import { Image, View, ScrollView, StyleSheet } from "react-native";

export default function AppMediaMealComponent() {
  const currentMonth = useSelector((state: RootState) => state.track.currentMonth);
  const dietData: DietDataState | [] = useSelector((state: RootState) => state.track.dietData);
  const formattedMonth: string = String(`${currentMonth.year}-${currentMonth.month}`);

  if (!Array.isArray(dietData)) {
    if (formattedMonth in dietData) {
      if (dietData[formattedMonth] && dietData[formattedMonth].length > 0) {
        // Sort the array by date in descending order
        const sortedData = [...dietData[formattedMonth]].sort((a: DietDataEntry, b: DietDataEntry) => {
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
        }, {} as Record<string, { date: string; data: DietDataEntry[] }>);

        // Convert the combined data object back to an array
        const finalData = Object.values(combinedData);

        return (
          <ScrollView>
            {finalData.map((item: { date: string | Date; data: DietDataEntry[] }, i) => {
              const formattedDate: string = typeof item.date === 'string' ? new Date(item.date).toLocaleDateString() : item.date.toLocaleDateString();

              return (
                <View key={i}>
                  <Text variant="titleLarge" style={[{ fontWeight: 600 }]}>{formattedDate}</Text>
                  <View style={styles.imagesParent}>{item.data.map((meal: DietDataEntry, ind) => (
                    <View key={ind}>
                      <Image style={styles.image} source={{ uri: meal.meal_picture }} />
                      <Text variant="titleMedium" style={[{ fontWeight: 600 }]}>
                        Meal at:
                        {typeof meal.date === 'string'
                          ? new Date(meal.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
                          : meal.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </Text>
                    </View>
                  ))}</View>
                  <Divider style={[{ marginBottom: 10 }]} />
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