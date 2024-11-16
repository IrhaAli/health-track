import React, { memo, useEffect, useState } from "react";
import { Divider, Text } from 'react-native-paper';
import { InteractionManager } from 'react-native';
import TrackDialog from "./trackDialog";
import TrackCalendar from "./trackCalendar";
import TrackCards from "./trackCards";
import i18n from "@/services/i18n";

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
      {!isReady ? (
        <Text>{i18n.t('loading')}</Text>
      ) : (
        <MemoizedTrackCards />
      )}
      <TrackDialog />
    </>
  );
}
