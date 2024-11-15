import React, { memo, useEffect, useState } from "react";
import { Divider } from 'react-native-paper';
import { InteractionManager } from 'react-native';
import TrackDialog from "./trackDialog";
import TrackCalendar from "./trackCalendar";
import TrackCards from "./trackCards";

const MemoizedTrackCards = memo(TrackCards);

export default function TrackComponent() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => setIsReady(true));
  }, []);

  return (
    <>
      <TrackCalendar />
      <Divider style={{ marginTop: 10 }} />
      {isReady && <MemoizedTrackCards />}
      <TrackDialog />
    </>
  );
}
