import React, { useCallback, useEffect, useState } from "react";
import { Divider } from 'react-native-paper';
import { InteractionManager } from 'react-native';

// Local Components Start.
import TrackDialog from "./trackDialog";
import TrackCalendar from "./trackCalendar";
import TrackCards from "./trackCards";
// Local Components End.

export default function TrackComponent() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      setIsReady(true);
    });
  }, []);

  const MemoizedTrackCards = useCallback(() => {
    return <TrackCards />;
  }, []);

  return (
    <>
      <TrackCalendar />
      <Divider style={[{ marginTop: 10}]} />
      {isReady && <MemoizedTrackCards />}
      <TrackDialog />
    </>
  );
}
