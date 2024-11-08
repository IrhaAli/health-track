import React from "react";
import { Text } from "react-native-paper";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { WaterDataState } from "@/types/track";

export default function WaterChartComponent() {
  const currentMonth = useSelector((state: RootState) => state.track.currentMonth);
  const waterData: WaterDataState | [] = useSelector((state: RootState) => state.track.waterData);
  const isLoading = useSelector((state: RootState) => state.track.loadingTrackWaterData);
  const formattedMonth = `${currentMonth.year}-${currentMonth.month}`;

  const getChartData = () => {
    if (Array.isArray(waterData) || !waterData[formattedMonth]?.length) {
      return [];
    }

    // Group water entries by day and sum amounts
    const dailyWaterAmounts = [...waterData[formattedMonth]].reduce((acc: {[key: string]: number}, water) => {
      const date = new Date(water.date);
      const day = String(date.getDate()).padStart(2, '0');
      const month = date.toLocaleString('default', { month: 'short' }).toLowerCase();
      const dateLabel = `${day} ${month}`;
      acc[dateLabel] = (acc[dateLabel] || 0) + water.intake_amount;
      return acc;
    }, {});

    // Convert to chart data format and sort by date
    return Object.entries(dailyWaterAmounts)
      .map(([dateLabel, amount]) => ({
        value: amount,
        label: dateLabel,
        frontColor: '#2196F3',
        gradientColor: '#E3F2FD',
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

  const emptyChartData = [
    { value: 0, label: '', frontColor: 'transparent' },
    { value: 0, label: '', frontColor: 'transparent' }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Water Intake (ML)</Text>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      ) : (
        <>
          <BarChart
            data={chartData.length > 0 ? chartData : emptyChartData}
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
            maxValue={chartData.length > 0 ? Math.max(...chartData.map(item => item.value)) + 500 : 2000}
            isAnimated
            animationDuration={500}
            barBorderRadius={4}
            gradientColor={'#E3F2FD'}
            backgroundColor={'#fff'}
          />
          {chartData.length === 0 && (
            <Text style={styles.noDataText}>No water data available for this month</Text>
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 16,
    color: '#666'
  }
});
