import { Platform } from 'react-native';
import { useFonts } from 'expo-font';
import AppLoading from 'expo-app-loading';
import { MD3LightTheme as DefaultTheme } from 'react-native-paper';
import React from 'react';

const tintColorLight = '#fff';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    submitButton: 'tomato',
    primaryColor: 'tomato',
    disabledButton: '#B0B0B0',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    submitButton: 'tomato',
    primaryColor: 'tomato',
    disabledButton: '#B0B0B0',
  },
};

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.light.text,
    secondary: Colors.light.icon,
  },
};

const themeColor = theme.colors.primary;
const lightThemeColor = Colors.light.background;

function getTheme() {
  const disabledColor = Colors.light.tabIconDefault;
  const [fontsLoaded] = useFonts({ 'HelveticaNeue': require('../assets/fonts/HelveticaNeueMedium.otf'), });

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  return {
    // arrows
    arrowColor: Colors.light.text,
    arrowStyle: {padding: 0},
    // knob
    expandableKnobColor: themeColor,
    // month
    monthTextColor: Colors.light.text,
    textMonthFontSize: 16,
    textMonthFontFamily: 'HelveticaNeue',
    textMonthFontWeight: 'bold' as const,
    // day names
    textSectionTitleColor: Colors.light.text,
    textDayHeaderFontSize: 12,
    textDayHeaderFontFamily: 'HelveticaNeue',
    textDayHeaderFontWeight: 'normal' as const,
    // dates
    dayTextColor: themeColor,
    todayTextColor: Colors.light.icon,
    textDayFontSize: 18,
    textDayFontFamily: 'HelveticaNeue',
    textDayFontWeight: '500' as const,
    textDayStyle: {marginTop: Platform.OS === 'android' ? 2 : 4},
    // selected date
    selectedDayBackgroundColor: themeColor,
    selectedDayTextColor: Colors.light.background,
    // disabled date
    textDisabledColor: disabledColor,
    // dot (marked date)
    dotColor: themeColor,
    selectedDotColor: Colors.light.background,
    disabledDotColor: disabledColor,
    dotStyle: {marginTop: -2},
    buttonBackgroundColor: Colors.light.submitButton,
  };
}

export default theme;
export { themeColor, lightThemeColor, getTheme };