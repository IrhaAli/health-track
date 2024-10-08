import React from "react";
import { View } from "react-native";
import { getAuth } from "firebase/auth";

// Local Components Start.
import TrackDialog from "./trackDialog";
import TrackCalendar from "./trackCalendar";
// Local Components End.

export default function TrackComponent() {
  console.log('A1 rendered');
  const userId = getAuth().currentUser?.uid || "PHCJD511ukbTHQfVXPu26N8rzqg1";

  console.log('component rendering parent');

  return (
    console.log('component rendered in return main'),

    <>
      <TrackCalendar></TrackCalendar>
      <TrackDialog></TrackDialog>
    </>
  );
}
