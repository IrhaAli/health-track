import React from "react";
import { Calendar } from "react-native-calendars";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentDate, setCurrentMonth } from "@/store/trackSlice";
import { AppDispatch, RootState } from "@/store/store";
import { Button, Text } from 'react-native-paper';

interface MonthChangeInterface {
    dateString: string;
    day: number;
    month: number;
    timestamp: number;
    year: number;
}

interface DayChangeInterface {
    dateString: string;
    day: number;
    month: number;
    timestamp: number;
    year: number;
}

export default function TrackComponent() {
    const dispatch = useDispatch<AppDispatch>();
    const currentDate = useSelector((state: RootState) => state.track.currentDate);
    const currentMonth = useSelector((state: RootState) => state.track.currentMonth);
    const nowMonth = { month: (new Date().getMonth() + 1), year: new Date().getFullYear() }

    const nextMonthDisable = (parseInt(currentMonth.year, 10) > nowMonth.year) || (parseInt(currentMonth.year, 10) === nowMonth.year && parseInt(currentMonth.month, 10) >= nowMonth.month);
    const previousButtonDisable = (parseInt(currentMonth.year, 10) < nowMonth.year) || (parseInt(currentMonth.year, 10) === nowMonth.year && parseInt(currentMonth.month, 10) <= 1);

    const handleMonthChange = (month: MonthChangeInterface) => {
        if ((String(month.month).padStart(2, "0") !== currentMonth.month) && (String(month.year) !== currentMonth.month)) {
            dispatch(setCurrentMonth({ month: String(month.month).padStart(2, "0"), year: String(month.year) }));
        }
    };

    return (
        <Calendar
            initialDate={currentDate}
            minDate={`${new Date(currentDate).getFullYear()}-01-01`}
            maxDate={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`}
            onMonthChange={handleMonthChange}
            onDayPress={(day: DayChangeInterface) => { dispatch(setCurrentDate(`${day.year}-${String(day.month).padStart(2, '0')}-${String(day.day).padStart(2, '0')}`)) }}
            hideExtraDays={true}
            firstDay={1}
            renderHeader={(date: any) => { return <Text variant="titleLarge">{new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date)} {date.getFullYear()}</Text> }}
            style={{ marginTop: 33 }}
            theme={{
                backgroundColor: 'transparent',
                calendarBackground: 'transparent',
                textSectionTitleColor: '#b6c1cd',
                textSectionTitleDisabledColor: '#d9e1e8',
                selectedDayBackgroundColor: '#00adf5',
                selectedDayTextColor: '#ffffff',
                todayTextColor: '#00adf5',
                dayTextColor: '#2d4150',
                textDisabledColor: '#d9e1e8',
                dotColor: '#00adf5',
                selectedDotColor: '#ffffff',
                arrowColor: 'blue',
                disabledArrowColor: '#d9e1e8',
                monthTextColor: 'blue',
                indicatorColor: 'blue',
                textDayFontFamily: 'monospace',
                textMonthFontFamily: 'monospace',
                textDayHeaderFontFamily: 'monospace',
                textDayFontWeight: '300',
                textMonthFontWeight: '700',
                textDayHeaderFontWeight: '300',
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
            renderArrow={(direction: string) => { return direction == 'left' ? <Button icon="arrow-left" mode="text" disabled={previousButtonDisable}>{''}</Button> : <Button icon="arrow-right" mode="text" disabled={nextMonthDisable}>{''}</Button> }}
            disableArrowRight={nextMonthDisable}
            disableArrowLeft={previousButtonDisable}
        />
    );
}
