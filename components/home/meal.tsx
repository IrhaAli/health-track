import React, { useState, useEffect } from "react";
import { Text } from "react-native-paper";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { DietDataState } from "@/types/track";
import AsyncStorage from '@react-native-async-storage/async-storage';
import translations from "@/translations/home.json";

export default function MealChartComponent() {
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [t, setT] = useState<any>(null);

  const currentMonth = useSelector((state: RootState) => state.track.currentMonth);
  const dietData: DietDataState | [] = useSelector((state: RootState) => state.track.dietData);
  const isLoading = useSelector((state: RootState) => state.track.loadingTrackDietData);
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
    if (Array.isArray(dietData) || !dietData[formattedMonth]?.length) {
      return [];
    }

    // Group meals by day and count them
    const dailyMealCounts = [...dietData[formattedMonth]].reduce((acc: {[key: string]: number}, meal) => {
      const date = new Date(meal.date);
      const day = String(date.getDate()).padStart(2, '0');
      const month = date.toLocaleString(currentLanguage, { month: 'short' }).toLowerCase();
      const dateLabel = `${day} ${month}`;
      acc[dateLabel] = (acc[dateLabel] || 0) + 1;
      return acc;
    }, {});

    // Convert to chart data format and sort by date
    return Object.entries(dailyMealCounts)
      .map(([dateLabel, count]) => ({
        value: count,
        label: dateLabel,
        frontColor: '#FF9800',
        gradientColor: '#FFF3E0',
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

  if (!t) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t.dailyMealCount}</Text>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF9800" />
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
            maxValue={chartData.length > 0 ? Math.max(...chartData.map(item => item.value)) + 1 : 5}
            isAnimated
            animationDuration={500}
            barBorderRadius={4}
            gradientColor={'#FFF3E0'}
            backgroundColor={'#fff'}
          />
          {chartData.length === 0 && !isLoading && (
            <Text style={styles.noDataText}>{t.noMealData}</Text>
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
    marginTop: 10,
    color: '#666'
  }
});
