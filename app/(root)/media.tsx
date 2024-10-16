import React, { useState } from "react";
import { View, Image, ScrollView } from "react-native";
import { Text } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function MediaScreen() {
  const allDietPictures = {};
  const allWeightPictures = {};
  const [dietPictures, setDietPictures] = useState([
    "https://firebasestorage.googleapis.com/v0/b/health-app-97.appspot.com/o/diet%2F1727033294057?alt=media&token=9bb730ac-0ac1-47ca-b7ad-a4edfbec1544",
    "https://firebasestorage.googleapis.com/v0/b/health-app-97.appspot.com/o/diet%2F1728392130138?alt=media&token=168fef69-2572-49d7-887e-20e4bc8b11c3",
    "https://firebasestorage.googleapis.com/v0/b/health-app-97.appspot.com/o/diet%2F1728392123744?alt=media&token=3efb0da6-b524-41f9-966e-54b8ec137045",
    "https://firebasestorage.googleapis.com/v0/b/health-app-97.appspot.com/o/diet%2F1727033313588?alt=media&token=53f2f17b-acc4-4db8-9253-a1c457b8fc83",
    "https://firebasestorage.googleapis.com/v0/b/health-app-97.appspot.com/o/diet%2F1726958313036?alt=media&token=3bcc6945-47ba-4c74-a27d-b52bfe497adc",
    "https://firebasestorage.googleapis.com/v0/b/health-app-97.appspot.com/o/diet%2F1728392764772?alt=media&token=5ef91b1c-389d-467b-9493-d630056516bb",
    "https://firebasestorage.googleapis.com/v0/b/health-app-97.appspot.com/o/diet%2F1728392537276?alt=media&token=4c3090f3-99f8-48ac-aff5-4919034a326c",
  ]);
  const [weightPictures, setWeightPictures] = useState([
    "https://firebasestorage.googleapis.com/v0/b/health-app-97.appspot.com/o/weight%2F1728397509141?alt=media&token=f43fd0f0-991d-43e4-9d83-b563092bae78",
    "https://firebasestorage.googleapis.com/v0/b/health-app-97.appspot.com/o/weight%2F1727031488297?alt=media&token=515a1ca2-04c8-4ae9-aadb-d80fbc6f860b",
  ]);
  const [dateChosen, setDateChosen] = useState(new Date());

  return (
    // Weight Picture Section
    <ScrollView style={[{ marginTop: 60 }]}>
      <Text>WEIGHT</Text>
      <Text>Latest Weight Picture</Text>
      <Image
        source={{ uri: weightPictures[0] }}
        width={100}
        height={200}
        resizeMode="contain"
      />
      <DateTimePicker
        mode="date"
        value={dateChosen}
        onChange={(event: any, date: Date | undefined) =>
          setDateChosen(date || new Date())
        }
      />
      <Image
        source={{ uri: weightPictures[1] }}
        width={100}
        height={200}
        resizeMode="contain"
      />
      <Text>DIET PICTURES</Text>
      {dietPictures.map((item, index) => (
        <Image
          key={index}
          source={{ uri: item }}
          width={100}
          height={200}
          resizeMode="contain"
        />
      ))}
    </ScrollView>
  );
}
