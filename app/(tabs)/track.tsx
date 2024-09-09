import React, { useRef, useCallback } from "react";
import { StyleSheet } from "react-native";
import {
  ExpandableCalendar,
  AgendaList,
  CalendarProvider,
  WeekCalendar,
} from "react-native-calendars";
import testIDs from "../calendar_files/testIDs";
import { agendaItems, getMarkedDates } from "../calendar_files/agendaItems";
import AgendaItem from "../calendar_files/AgendaItem";
import { getTheme, themeColor, lightThemeColor } from "../theme";

const leftArrowIcon = require("../img/previous.png");
const rightArrowIcon = require("../img/next.png");
const ITEMS: any[] = agendaItems;

export default function TabTwoScreen() {
  const marked = useRef(getMarkedDates());
  const theme = useRef(getTheme());
  const todayBtnTheme = useRef({
    todayButtonTextColor: themeColor,
  });

  // const onDateChanged = useCallback((date, updateSource) => {
  //   console.log('ExpandableCalendarScreen onDateChanged: ', date, updateSource);
  // }, []);

  // const onMonthChange = useCallback(({dateString}) => {
  //   console.log('ExpandableCalendarScreen onMonthChange: ', dateString);
  // }, []);

  const renderItem = useCallback(({ item }: any) => {
    return <AgendaItem item={item} />;
  }, []);

  return (
    <CalendarProvider
      date={ITEMS[1]?.title}
      // onDateChanged={onDateChanged}
      // onMonthChange={onMonthChange}
      showTodayButton
      // disabledOpacity={0.6}
      theme={todayBtnTheme.current}
      // todayBottomMargin={16}
    >
      <ExpandableCalendar
        testID={testIDs.expandableCalendar.CONTAINER}
        // horizontal={false}
        // hideArrows
        disablePan
        hideKnob
        initialPosition={ExpandableCalendar.positions.OPEN}
        calendarStyle={styles.calendar}
        headerStyle={styles.header} // for horizontal only
        // disableWeekScroll
        theme={theme.current}
        // disableAllTouchEventsForDisabledDays
        firstDay={1}
        markedDates={marked.current}
        leftArrowImageSource={leftArrowIcon}
        rightArrowImageSource={rightArrowIcon}
        // animateScroll={false}
        // closeOnDayPress={false}
      />
      <AgendaList
        sections={ITEMS}
        renderItem={renderItem}
        // scrollToNextEvent={false}
        sectionStyle={styles.section}
        // dayFormat={'yyyy-MM-d'}
      />
    </CalendarProvider>
  );
}

const styles = StyleSheet.create({
  calendar: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  header: {
    backgroundColor: "lightgrey",
    marginTop: 50,
  },
  section: {
    backgroundColor: lightThemeColor,
    color: "grey",
    textTransform: "capitalize",
  },
});
