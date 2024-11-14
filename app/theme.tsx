import { Platform } from 'react-native';
import { useFonts } from 'expo-font';
import AppLoading from 'expo-app-loading';
import { MD3LightTheme as DefaultTheme } from 'react-native-paper';
import React from 'react';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: 'tomato',
    secondary: 'yellow',
  },
};

const themeColor = theme.colors.primary;
const lightThemeColor = '#f2f7f7';

function getTheme() {
  const disabledColor = 'grey';
  const [fontsLoaded] = useFonts({ 'HelveticaNeue': require('../assets/fonts/HelveticaNeueMedium.otf'), });

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  return {
    // arrows
    arrowColor: 'black',
    arrowStyle: {padding: 0},
    // knob
    expandableKnobColor: themeColor,
    // month
    monthTextColor: 'black',
    textMonthFontSize: 16,
    textMonthFontFamily: 'HelveticaNeue',
    textMonthFontWeight: 'bold' as const,
    // day names
    textSectionTitleColor: 'black',
    textDayHeaderFontSize: 12,
    textDayHeaderFontFamily: 'HelveticaNeue',
    textDayHeaderFontWeight: 'normal' as const,
    // dates
    dayTextColor: themeColor,
    todayTextColor: theme.colors.secondary,
    textDayFontSize: 18,
    textDayFontFamily: 'HelveticaNeue',
    textDayFontWeight: '500' as const,
    textDayStyle: {marginTop: Platform.OS === 'android' ? 2 : 4},
    // selected date
    selectedDayBackgroundColor: themeColor,
    selectedDayTextColor: 'white',
    // disabled date
    textDisabledColor: disabledColor,
    // dot (marked date)
    dotColor: themeColor,
    selectedDotColor: 'white',
    disabledDotColor: disabledColor,
    dotStyle: {marginTop: -2}
  };
}

export default theme;
export { themeColor, lightThemeColor, getTheme };