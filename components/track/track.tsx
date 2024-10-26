import React from "react";
import { Divider } from 'react-native-paper';

// Local Components Start.
import TrackDialog from "./trackDialog";
import TrackCalendar from "./trackCalendar";
import TrackCards from "./trackCards";
// Local Components End.

export default function TrackComponent() {
  return (
    <>
      <TrackCalendar></TrackCalendar>
      <Divider style={[{ marginTop: 10}]}/>
      <TrackCards></TrackCards>
      <TrackDialog></TrackDialog>
    </>
  );
}
