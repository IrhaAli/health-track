import React from "react";
import { Text } from "react-native-paper";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { DietDataState } from "@/types/track";

export default function FastingChartComponent() {
  const currentMonth = useSelector((state: RootState) => state.track.currentMonth);
  const dietData: DietDataState | [] = useSelector((state: RootState) => state.track.dietData);
  const isLoading = useSelector((state: RootState) => state.track.loadingTrackDietData);
  const formattedMonth = `${currentMonth.year}-${currentMonth.month}`;

  const getChartData = () => {
    if (Array.isArray(dietData) || !dietData[formattedMonth]?.length) {
      return [];
    }

    // Sort meals by date
    const sortedMeals = [...dietData[formattedMonth]].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calculate fasting hours between meals
    const fastingHours: {[key: string]: number} = {};
    
    for (let i = 1; i < sortedMeals.length; i++) {
      const prevMealDate = new Date(sortedMeals[i-1].date);
      const currentMealDate = new Date(sortedMeals[i].date);
      
      // Only calculate if meals are on different days
      if (prevMealDate.getDate() !== currentMealDate.getDate()) {
        const hours = (currentMealDate.getTime() - prevMealDate.getTime()) / (1000 * 60 * 60);
        
        const day = String(currentMealDate.getDate()).padStart(2, '0');
        const month = currentMealDate.toLocaleString('default', { month: 'short' }).toLowerCase();
        const dateLabel = `${day} ${month}`;
        
        fastingHours[dateLabel] = hours;
      }
    }

    // Convert to chart data format and sort by date
    return Object.entries(fastingHours)
      .map(([dateLabel, hours]) => ({
        value: Math.round(hours * 10) / 10, // Round to 1 decimal place
        label: dateLabel,
        frontColor: '#4CAF50',
        gradientColor: '#E8F5E9',
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Fasting Hours</Text>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : (
        <>
          <BarChart
            data={chartData.length > 0 ? chartData : [
              { value: 0, label: '', frontColor: 'transparent' },
              { value: 0, label: '', frontColor: 'transparent' }
            ]}
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
            maxValue={chartData.length > 0 ? Math.max(...chartData.map(item => item.value)) + 2 : 24}
            isAnimated
            animationDuration={500}
            barBorderRadius={4}
            gradientColor={'#E8F5E9'}
            backgroundColor={'#fff'}
          />
          {chartData.length === 0 && !isLoading && (
            <Text style={styles.noDataText}>No fasting data available for this month</Text>
          )}
        </>
      )}
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
  loadingContainer: {
    minHeight: 300,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  noDataText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 16,
  }
});
