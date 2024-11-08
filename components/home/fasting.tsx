import React from "react";
import { Text } from "react-native-paper";
import { StyleSheet, View } from "react-native";
import { BarChart, barDataItem } from "react-native-gifted-charts";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { DietDataState } from "@/types/track";

export default function FastingChartComponent() {
  const currentMonth = useSelector((state: RootState) => state.track.currentMonth);
  const dietData: DietDataState | [] = useSelector((state: RootState) => state.track.dietData);
  const formattedMonth = `${currentMonth.year}-${currentMonth.month}`;

  const getChartData = () => {
    if (Array.isArray(dietData) || !dietData[formattedMonth]?.length) {
      return [];
    }

    // Group meals by day
    const mealsByDay: { [key: string]: Date[] } = {};
    [...dietData[formattedMonth]].forEach(meal => {
      const date = new Date(meal.date);
      const day = String(date.getDate()).padStart(2, '0');
      const month = date.toLocaleString('default', { month: 'short' }).toLowerCase();
      const dateLabel = `${day} ${month}`;
      
      if (!mealsByDay[dateLabel]) {
        mealsByDay[dateLabel] = [];
      }
      mealsByDay[dateLabel].push(date);
    });

    // Calculate fasting periods for each day
    return Object.entries(mealsByDay)
      .map(([dateLabel, dates]) => {
        // Sort meals chronologically
        dates.sort((a, b) => a.getTime() - b.getTime());
        
        if (dates.length < 2) return null;

        // Calculate fasting period between last meal of current day and first meal of next day
        const fastingHours = dates.reduce((maxFasting, curr, idx, arr) => {
          if (idx === 0) return maxFasting;
          
          const prevMeal = arr[idx - 1];
          const diff = (curr.getTime() - prevMeal.getTime()) / (1000 * 60 * 60); // Convert to hours
          
          return diff > maxFasting && diff < 24 ? diff : maxFasting;
        }, 0);

        if (fastingHours === 0) return null;

        return {
          value: Number(fastingHours.toFixed(1)),
          label: dateLabel,
          frontColor: '#4CAF50',
          gradientColor: '#E8F5E9',
        };
      })
      .filter((item): item is { value: number; label: string; frontColor: string; gradientColor: string; } => item !== null)
      .sort((a, b) => {
        const [dayA, monthA] = a.label.split(' ');
        const [dayB, monthB] = b.label.split(' '); 
        const dateA = new Date(`${monthA} ${dayA}, ${currentMonth.year}`);
        const dateB = new Date(`${monthB} ${dayB}, ${currentMonth.year}`);
        return dateA.getTime() - dateB.getTime();
      });
  };

  const chartData = getChartData();

  if (chartData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text>No fasting data available for this month</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Maximum Fasting Duration Per Day (Hours)</Text>
      <BarChart
        data={chartData as barDataItem[]}
        barWidth={20}
        spacing={10}
        roundedTop
        roundedBottom
        hideRules
        xAxisThickness={0.5}
        yAxisThickness={0.5}
        yAxisTextStyle={{ color: '#666', fontSize: 10 }}
        xAxisLabelTextStyle={{ 
          color: '#666', 
          fontSize: 10,
          transform: [{rotate: '-90deg'}],
          marginTop: 5,
          width: 45,
          height: 14,
          textAlign: 'center',
          alignSelf: 'center'
        }}
        noOfSections={4}
        maxValue={Math.max(...chartData.map((item: barDataItem) => item.value)) + 2}
        isAnimated
        animationDuration={500}
        barBorderRadius={4}
        gradientColor={'#E8F5E9'}
        backgroundColor={'#fff'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
