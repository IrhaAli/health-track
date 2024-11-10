import React, { useState, useEffect } from "react";
import { Text } from "react-native-paper";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { WeightDataState } from "@/types/track";
import AsyncStorage from '@react-native-async-storage/async-storage';
import translations from "@/translations/home.json";

export default function WeightChartComponent() {
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [t, setT] = useState<any>(null);

  const currentMonth = useSelector((state: RootState) => state.track.currentMonth);
  const weightData: WeightDataState | [] = useSelector((state: RootState) => state.track.weightData);
  const isLoading = useSelector((state: RootState) => state.track.loadingTrackWeightData);
  const formattedMonth = `${currentMonth.year}-${currentMonth.month}`;

  useEffect(() => {
    const initLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('userLanguage');
        const effectiveLanguage = savedLanguage || 'en';
        setCurrentLanguage(effectiveLanguage);
        setT(translations[effectiveLanguage as keyof typeof translations]);
      } catch (error) {
        console.error('Error getting language:', error);
        setT(translations.en);
      }
    };
    initLanguage();
  }, []);

  // Listen for language changes
  useEffect(() => {
    const checkLanguageChanges = async () => {
      try {
        const newLanguage = await AsyncStorage.getItem('userLanguage');
        if (newLanguage && newLanguage !== currentLanguage) {
          setCurrentLanguage(newLanguage);
          setT(translations[newLanguage as keyof typeof translations]);
        }
      } catch (error) {
        console.error('Error checking language changes:', error);
      }
    };

    const intervalId = setInterval(checkLanguageChanges, 1000);
    return () => clearInterval(intervalId);
  }, [currentLanguage]);

  const getChartData = () => {
    if (Array.isArray(weightData) || !weightData[formattedMonth]?.length) {
      return [];
    }

    // Group weight entries by day
    const dailyWeights = [...weightData[formattedMonth]].reduce((acc: {[key: string]: number}, weight) => {
      const date = new Date(weight.date);
      const day = String(date.getDate()).padStart(2, '0');
      const month = date.toLocaleString(currentLanguage, { month: 'short' }).toLowerCase();
      const dateLabel = `${day} ${month}`;
      acc[dateLabel] = weight.weight;
      return acc;
    }, {});

    // Convert to chart data format and sort by date
    return Object.entries(dailyWeights)
      .map(([dateLabel, weight]) => ({
        value: weight,
        label: dateLabel,
        frontColor: '#9C27B0',
        gradientColor: '#F3E5F5',
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
      <Text style={styles.title}>{t?.weightTitle || 'Daily Weight (Kg)'}</Text>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9C27B0" />
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
            maxValue={chartData.length > 0 ? Math.max(...chartData.map(item => item.value)) + 5 : 100}
            isAnimated
            animationDuration={500}
            barBorderRadius={4}
            gradientColor={'#F3E5F5'}
            backgroundColor={'#fff'}
          />
          {chartData.length === 0 && (
            <Text style={styles.noDataText}>{t?.noWeightData || 'No weight data available for this month'}</Text>
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
