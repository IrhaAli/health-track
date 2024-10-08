import React from "react";
import { getAuth } from "firebase/auth";
import { Divider } from 'react-native-paper';

// Local Components Start.
import TrackDialog from "./trackDialog";
import TrackCalendar from "./trackCalendar";
import TrackCards from "./trackCards";
// Local Components End.

export default function TrackComponent() {
  console.log('A1 rendered main parent');
  const userId = getAuth().currentUser?.uid || "PHCJD511ukbTHQfVXPu26N8rzqg1";

  return (
    console.log('component rendered in return main'),

    <>
      <TrackCalendar></TrackCalendar>
      <Divider style={[{ marginTop: 10}]}/>
      <TrackCards></TrackCards>
      <TrackDialog></TrackDialog>
    </>
  );
}
