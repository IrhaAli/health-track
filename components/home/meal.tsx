import React from "react";
import { Text } from "react-native-paper";
import { StyleSheet, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { DietDataState } from "@/types/track";

export default function MealChartComponent() {
  const currentMonth = useSelector((state: RootState) => state.track.currentMonth);
  const dietData: DietDataState | [] = useSelector((state: RootState) => state.track.dietData);
  const formattedMonth = `${currentMonth.year}-${currentMonth.month}`;

  const getChartData = () => {
    if (Array.isArray(dietData) || !dietData[formattedMonth]?.length) {
      return [];
    }

    // Group meals by day and count them
    const dailyMealCounts = [...dietData[formattedMonth]].reduce((acc: {[key: string]: number}, meal) => {
      const date = new Date(meal.date);
      const day = String(date.getDate()).padStart(2, '0');
      const month = date.toLocaleString('default', { month: 'short' }).toLowerCase(); // Changed to short month name
      const dateLabel = `${day} ${month}`;
      acc[dateLabel] = (acc[dateLabel] || 0) + 1;
      return acc;
    }, {});

    // Convert to chart data format and sort by date
    return Object.entries(dailyMealCounts)
      .map(([dateLabel, count]) => ({
        value: count,
        label: dateLabel,
        frontColor: '#FF6B6B',
        gradientColor: '#FFE8E8',
      }))
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
        <Text>No meal data available for this month</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Meal Count</Text>
      <BarChart
        data={chartData}
        barWidth={20}
        spacing={10} // Increased spacing to accommodate rotated labels
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
          textAlign: 'center', // Add text alignment
          alignSelf: 'center' // Center the text container
        }}
        noOfSections={4}
        maxValue={Math.max(...chartData.map(item => item.value)) + 1}
        isAnimated
        animationDuration={500}
        barBorderRadius={4}
        // showGradient
        gradientColor={'#FFE8E8'}
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
