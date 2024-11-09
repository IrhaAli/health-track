import { RootState } from "@/store/store";
import { WeightDataEntry, WeightDataState } from "@/types/track";
import React from "react";
import { useSelector } from "react-redux";
import { Divider, Text, Surface } from "react-native-paper";
import { Image, View, ScrollView, StyleSheet, Dimensions, Animated, TouchableOpacity } from "react-native";
import { ImageModal } from "./imageModal";

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = SCREEN_WIDTH * 0.3; // Reduced to fit 3 cards per row

export default function AppMediaWeightComponent() {
  const currentMonth = useSelector((state: RootState) => state.track.currentMonth);
  const weightData: WeightDataState | [] = useSelector((state: RootState) => state.track.weightData);
  const formattedMonth = `${currentMonth.year}-${currentMonth.month}`;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

  React.useEffect(() => {
    fadeAnim.setValue(0); // Reset animation value
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [currentMonth, formattedMonth]);

  if (Array.isArray(weightData) || !weightData[formattedMonth]?.length) {
    return null;
  }

  const groupedData = [...weightData[formattedMonth]]
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    })
    .reduce((acc: { [key: string]: { date: string; data: WeightDataEntry[] } }, entry) => {
        // Create date in local timezone to avoid timezone offset issues
        const entryDate = new Date(entry.date);
        const dateKey = `${entryDate.getFullYear()}-${String(entryDate.getMonth() + 1).padStart(2, '0')}-${String(entryDate.getDate()).padStart(2, '0')}`;
      if (!acc[dateKey]) {
        acc[dateKey] = { date: dateKey, data: [] };
      }
      acc[dateKey].data.push(entry);
      return acc;
    }, {});

  return (
    <>
      <ScrollView>
        {Object.values(groupedData).map((group, index) => (
          <View key={index}>
            <View style={styles.dateContainer}>
              <Surface style={styles.dateSurface} elevation={1}>
                <Text variant="titleLarge" style={styles.dateText}>
                  {new Date(group.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
              </Surface>
            </View>
            <View style={styles.imagesParent}>
              {group.data.map((weight, i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.animatedCard,
                    {
                      opacity: fadeAnim,
                      transform: [{
                        translateY: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [50, 0]
                        })
                      }, {
                        scale: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.8, 1]
                        })
                      }]
                    }
                  ]}
                >
                  <TouchableOpacity onPress={() => setSelectedImage(weight.picture)}>
                    <Surface style={styles.card} elevation={2}>
                      <Image 
                        style={styles.image} 
                        source={{ uri: weight.picture }}
                        resizeMode="cover"
                      />
                      <View style={styles.timeContainer}>
                        <Text variant="titleSmall" style={styles.timeText}>
                          {new Date(weight.date).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit', 
                            hour12: true 
                          }).toUpperCase()}
                        </Text>
                      </View>
                    </Surface>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
            <Divider style={styles.divider} />
          </View>
        ))}
      </ScrollView>

      <ImageModal 
        visible={!!selectedImage}
        imageUri={selectedImage}
        onDismiss={() => setSelectedImage(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  imagesParent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 8,
    gap: 16,
  },
  animatedCard: {
    margin: 8,
    maxWidth: `${100/3}%`,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.5,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  dateContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  dateSurface: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  dateText: {
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  timeContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
  },
  timeText: {
    color: '#fff',
    textAlign: 'center',
  },
  divider: {
    marginVertical: 16,
  }
});
