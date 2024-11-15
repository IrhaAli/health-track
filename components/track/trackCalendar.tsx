import React from "react";
import { Calendar } from "react-native-calendars";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentDate, setCurrentMonth } from "@/store/trackSlice";
import { AppDispatch, RootState } from "@/store/store";
import { Button, Text } from 'react-native-paper';

interface DateChangeInterface {
  dateString: string;
  day: number;
  month: number;
  timestamp: number;
  year: number;
}

export default function TrackComponent() {
  const dispatch = useDispatch<AppDispatch>();
  const { currentDate, currentMonth } = useSelector((state: RootState) => state.track);
  const today = new Date();
  const nowMonth = { 
    month: today.getMonth() + 1, 
    year: today.getFullYear() 
  };

  const currentMonthNum = parseInt(currentMonth.month, 10);
  const currentYearNum = parseInt(currentMonth.year, 10);

  const nextMonthDisable = currentYearNum > nowMonth.year || 
    (currentYearNum === nowMonth.year && currentMonthNum >= nowMonth.month);
  const previousButtonDisable = currentYearNum < nowMonth.year || 
    (currentYearNum === nowMonth.year && currentMonthNum <= 1);

  const handleMonthChange = ({ month, year }: DateChangeInterface) => {
    const paddedMonth = String(month).padStart(2, "0");
    if (paddedMonth !== currentMonth.month || String(year) !== currentMonth.year) {
      dispatch(setCurrentMonth({ month: paddedMonth, year: String(year) }));
    }
  };

  const handleDayPress = ({ year, month, day }: DateChangeInterface) => {
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    dispatch(setCurrentDate(date));
  };

  const renderArrow = (direction: string) => (
    <Button 
      icon={`arrow-${direction}`} 
      mode="text"
      disabled={direction === 'left' ? previousButtonDisable : nextMonthDisable}
    >
      {''}
    </Button>
  );

  const renderHeader = (date: Date) => (
    <Text variant="titleLarge">
      {new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date)} {date.getFullYear()}
    </Text>
  );

  return (
    <Calendar
      initialDate={currentDate}
      minDate={`${today.getFullYear()}-01-01`}
      maxDate={`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`}
      onMonthChange={handleMonthChange}
      onDayPress={handleDayPress}
      hideExtraDays
      firstDay={1}
      renderHeader={renderHeader}
      renderArrow={renderArrow}
      style={{ marginTop: 33 }}
      theme={{
        backgroundColor: 'transparent',
        calendarBackground: 'transparent',
        textSectionTitleColor: '#b6c1cd',
        selectedDayBackgroundColor: '#00adf5',
        selectedDayTextColor: '#ffffff',
        todayTextColor: '#00adf5',
        dayTextColor: '#2d4150',
        textDisabledColor: '#d9e1e8',
        arrowColor: 'blue',
        monthTextColor: 'blue',
        textDayFontFamily: 'monospace',
        textMonthFontFamily: 'monospace',
        textDayHeaderFontFamily: 'monospace',
        textDayFontSize: 16,
        textMonthFontSize: 16,
        textDayHeaderFontSize: 16,
        'stylesheet.calendar.header': {
          week: {
            marginTop: 0,
            flexDirection: 'row',
            justifyContent: 'space-between'
          },
          dayTextAtIndex0: { color: 'red' },
          dayTextAtIndex6: { color: 'blue' }
        }
      }}
      markedDates={{
        [currentDate]: {
          selected: true,
          selectedColor: "tomato",
          selectedTextColor: "white",
        },
      }}
      disableArrowRight={nextMonthDisable}
      disableArrowLeft={previousButtonDisable}
    />
  );
}
