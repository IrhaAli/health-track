import React from "react";
import { getAuth } from "firebase/auth";
import { Divider } from 'react-native-paper';

// Local Components Start.
import TrackDialog from "./trackDialog";
import TrackCalendar from "./trackCalendar";
import TrackCards from "./trackCards";
// Local Components End.

export default function TrackComponent() {
  const userId = getAuth().currentUser?.uid || "PHCJD511ukbTHQfVXPu26N8rzqg1";

  return (
    <>
      <TrackCalendar></TrackCalendar>
      <Divider style={[{ marginTop: 10}]}/>
      <TrackCards></TrackCards>
      <TrackDialog></TrackDialog>
    </>
  );
}
