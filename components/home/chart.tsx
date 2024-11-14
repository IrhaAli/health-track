import React from "react";
import { Text } from "react-native-paper";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import i18n from "@/services/i18n";
import { DietDataState, SleepDataState, WaterDataState, WeightDataState } from "@/types/track";

interface ChartProps {
  type: 'fasting' | 'meal' | 'sleep' | 'water' | 'weight';
  color: string;
  title: string;
  noDataText: string;
  maxValueOffset?: number;
  defaultMaxValue?: number;
}

export default function ChartComponent({
  type,
  color,
  title,
  noDataText,
  maxValueOffset = 2,
  defaultMaxValue = 24
}: ChartProps) {
  const currentMonth = useSelector((state: RootState) => state.track.currentMonth);
  const data = useSelector((state: RootState) => {
    switch (type) {
      case 'water':
        return state.track.waterData;
      case 'sleep':
        return state.track.sleepData;
      case 'weight':
        return state.track.weightData;
      case 'meal':
      case 'fasting':
        return state.track.dietData;
      default:
        return [];
    }
  });
  const isLoading = useSelector((state: RootState) => {
    switch (type) {
      case 'water':
        return state.track.loadingTrackWaterData;
      case 'sleep':
        return state.track.loadingTrackSleepData;
      case 'weight':
        return state.track.loadingTrackWeightData;
      case 'meal':
      case 'fasting':
        return state.track.loadingTrackDietData;
      default:
        return false;
    }
  });
  const formattedMonth = `${currentMonth.year}-${currentMonth.month}`;

  const getChartData = () => {
    if (Array.isArray(data) || !data[formattedMonth]?.length) {
      return [];
    }

    const formatDateLabel = (date: Date) => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = date.toLocaleString(i18n.locale, { month: 'short' }).toLowerCase();
      return `${day} ${month}`;
    };

    const processData = (entries: any[], valueKey: string, accumulate: boolean = false) => {
      return entries.reduce((acc: {[key: string]: number}, entry) => {
        const date = new Date(entry.date || entry.wakeup_time);
        const dateLabel = formatDateLabel(date);
        const value = valueKey === 'sleep_duration' ? entry[valueKey] / 60 : entry[valueKey];
        acc[dateLabel] = accumulate ? (acc[dateLabel] || 0) + value : value;
        return acc;
      }, {});
    };

    let processedData: {[key: string]: number} = {};

    switch (type) {
      case 'sleep':
        processedData = processData(data[formattedMonth], 'sleep_duration');
        break;
      case 'meal': {
        // Group meals by day and count them
        processedData = data[formattedMonth].reduce((acc: {[key: string]: number}, meal) => {
          if (!meal.date) return acc;
          const date = new Date(meal.date);
          const dateLabel = formatDateLabel(date);
          acc[dateLabel] = (acc[dateLabel] || 0) + 1;
          return acc;
        }, {});
        break;
      }
      case 'water': {
        // Process water data by summing intake amounts per day
        processedData = data[formattedMonth].reduce((acc: {[key: string]: number}, entry) => {
          if (!entry.date) return acc;
          const date = new Date(entry.date);
          const dateLabel = formatDateLabel(date);
          // Type guard to check if entry is WaterDataEntry
          if ('intake_amount' in entry) {
            acc[dateLabel] = (acc[dateLabel] || 0) + (entry.intake_amount || 0);
          }
          return acc;
        }, {});
        break;
      }
      case 'weight':
        processedData = processData(data[formattedMonth], 'weight');
        break;
      case 'fasting': {
        const sortedMeals = [...data[formattedMonth]].sort((a, b) => {
          if (!a.date || !b.date) return 0;
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
        
        for (let i = 1; i < sortedMeals.length; i++) {
          const prevMeal = sortedMeals[i-1];
          const currMeal = sortedMeals[i];
          
          if (!prevMeal.date || !currMeal.date) continue;
          
          const prevDate = new Date(prevMeal.date);
          const currDate = new Date(currMeal.date);
          
          if (prevDate.getDate() !== currDate.getDate()) {
            const hours = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60);
            processedData[formatDateLabel(currDate)] = hours;
          }
        }
        break;
      }
    }

    return Object.entries(processedData)
      .map(([dateLabel, value]) => ({
        value: type === 'fasting' ? Math.round(value * 10) / 10 : value,
        label: dateLabel,
        frontColor: color,
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

  const calculateMaxValue = () => {
    if (chartData.length === 0) return defaultMaxValue;
    
    const maxDataValue = Math.max(...chartData.map(item => item.value));
    
    switch (type) {
      case 'meal':
        return Math.min(Math.ceil(maxDataValue + 1), 10);
      case 'fasting':
        return Math.min(Math.ceil(maxDataValue + 100), 1000);
      case 'sleep':
        return Math.min(Math.ceil(maxDataValue + 2), 24);
      case 'water':
        return Math.min(Math.ceil(maxDataValue + 50), 500);
      case 'weight':
        return Math.ceil(maxDataValue + 5);
      default:
        return Math.ceil(maxDataValue + maxValueOffset);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={color} />
        </View>
      ) : (
        <>
          <BarChart
            data={chartData.length > 0 ? chartData : emptyChartData}
            barWidth={20}
            spacing={5}
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
            maxValue={calculateMaxValue()}
            isAnimated
            animationDuration={500}
            barBorderRadius={4}
            backgroundColor={'#fff'}
          />
          {chartData.length === 0 && !isLoading && (
            <Text style={styles.noDataText}>{noDataText}</Text>
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
    minHeight: 200,
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
  noDataText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 16,
  }
});
