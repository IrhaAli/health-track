import React from "react";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentDate, setCurrentMonth } from "@/store/trackSlice";
import { AppDispatch, RootState } from "@/store/store";
import { Button, Text } from 'react-native-paper';
import i18n from "@/services/i18n";

// Configure calendar localization
LocaleConfig.locales[i18n.locale] = {
  monthNames: [
    i18n.t('months.january'),
    i18n.t('months.february'), 
    i18n.t('months.march'),
    i18n.t('months.april'),
    i18n.t('months.may'),
    i18n.t('months.june'),
    i18n.t('months.july'),
    i18n.t('months.august'),
    i18n.t('months.september'),
    i18n.t('months.october'),
    i18n.t('months.november'),
    i18n.t('months.december')
  ],
  monthNamesShort: [
    i18n.t('months.january').slice(0,3),
    i18n.t('months.february').slice(0,3),
    i18n.t('months.march').slice(0,3),
    i18n.t('months.april').slice(0,3),
    i18n.t('months.may').slice(0,3),
    i18n.t('months.june').slice(0,3),
    i18n.t('months.july').slice(0,3),
    i18n.t('months.august').slice(0,3),
    i18n.t('months.september').slice(0,3),
    i18n.t('months.october').slice(0,3),
    i18n.t('months.november').slice(0,3),
    i18n.t('months.december').slice(0,3)
  ],
  dayNames: [
    i18n.t('media.weekdays.sunday'),
    i18n.t('media.weekdays.monday'),
    i18n.t('media.weekdays.tuesday'),
    i18n.t('media.weekdays.wednesday'),
    i18n.t('media.weekdays.thursday'),
    i18n.t('media.weekdays.friday'),
    i18n.t('media.weekdays.saturday')
  ],
  dayNamesShort: [
    i18n.t('media.weekdays.sunday').slice(0,3),
    i18n.t('media.weekdays.monday').slice(0,3),
    i18n.t('media.weekdays.tuesday').slice(0,3),
    i18n.t('media.weekdays.wednesday').slice(0,3),
    i18n.t('media.weekdays.thursday').slice(0,3),
    i18n.t('media.weekdays.friday').slice(0,3),
    i18n.t('media.weekdays.saturday').slice(0,3)
  ],
  today: i18n.t('calendar.today')
};

LocaleConfig.defaultLocale = i18n.locale;

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
      {i18n.t('monthsFormat.long', {
        month: new Intl.DateTimeFormat(i18n.locale, { month: 'long' }).format(date).charAt(0).toUpperCase() + 
              new Intl.DateTimeFormat(i18n.locale, { month: 'long' }).format(date).slice(1),
        year: date.getFullYear()
      })}
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
