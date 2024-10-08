import React from 'react';
import { ViewStyle } from 'react-native';
import { ExpandableCalendar } from 'react-native-calendars';

const leftArrowIcon = require("../../app/img/previous.png");
const rightArrowIcon = require("../../app/img/next.png");

interface TrackExpandableCalendarProps {
    testID?: string;
    disablePan?: boolean;
    hideKnob?: boolean;
    initialPosition?: any;
    calendarStyle?: ViewStyle;
    headerStyle?: ViewStyle;
    firstDay?: number;
    leftArrowImageSource?: string;
    rightArrowImageSource?: string;
    currentDate: string;
    allowShadow?: boolean;
    horizontal?: boolean;
    closeOnDayPress?: boolean;
}

const TrackExpandableCalendar: React.FC<TrackExpandableCalendarProps> = ({
    testID = "expandableCalendarContainer",
    disablePan = true,
    hideKnob = true,
    initialPosition = ExpandableCalendar.positions.OPEN,
    calendarStyle = {
        paddingLeft: 20,
        paddingRight: 20,
    },
    headerStyle = {
        backgroundColor: "lightgrey",
        marginTop: 50
    },
    firstDay = 1,
    leftArrowImageSource = leftArrowIcon,
    rightArrowImageSource = rightArrowIcon,
    currentDate,
    allowShadow = true,
    horizontal = true,
    closeOnDayPress = true,
}) => {
    return (
        <ExpandableCalendar
            testID={testID}
            disablePan={disablePan}
            hideKnob={hideKnob}
            initialPosition={initialPosition}
            calendarStyle={calendarStyle}
            headerStyle={headerStyle}
            firstDay={firstDay}
            leftArrowImageSource={leftArrowImageSource}
            rightArrowImageSource={rightArrowImageSource}
            allowShadow={allowShadow}
            horizontal={horizontal}
            closeOnDayPress={closeOnDayPress}
            // maxDate={`${new Date(new Date(currentDate).setDate(new Date(currentDate).getDate() - 1))}`}
            // markedDates={{
            //     [currentDate]: {
            //         selected: true,
            //         selectedColor: "yellow",
            //         selectedTextColor: "black",
            //     },
            // }}


            // -    openThreshold: PAN_GESTURE_THRESHOLD,
            // -    closeThreshold: PAN_GESTURE_THRESHOLD,
        />
    );
};

export default TrackExpandableCalendar;
