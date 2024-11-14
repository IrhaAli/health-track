import { RootState } from "@/store/store";
import { DietDataEntry, DietDataState } from "@/types/track";
import React from "react";
import { useSelector } from "react-redux";
import { Divider, Text, Surface, Portal, Modal, IconButton } from "react-native-paper";
import { Image, View, ScrollView, StyleSheet, Dimensions, Animated, TouchableOpacity, Platform } from "react-native";
import { ImageModal } from "./imageModal";
import i18n from "@/services/i18n";

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = SCREEN_WIDTH * 0.3;

export default function AppMediaMealComponent() {
  const currentMonth = useSelector((state: RootState) => state.track.currentMonth);
  const dietData: DietDataState | [] = useSelector((state: RootState) => state.track.dietData);
  const formattedMonth = React.useMemo(() => `${currentMonth.year}-${currentMonth.month}`, [currentMonth]);
  const fadeAnim = React.useRef(new Animated.Value(1)).current;
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

  const groupedData = React.useMemo(() => {
    if (Array.isArray(dietData) || !dietData[formattedMonth]?.length) {
      return {};
    }

    return [...dietData[formattedMonth]]
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB.getTime() - dateA.getTime();
      })
      .reduce((acc: { [key: string]: { date: string; data: DietDataEntry[] } }, entry) => {
        const entryDate = new Date(entry.date);
        const dateKey = `${entryDate.getFullYear()}-${String(entryDate.getMonth() + 1).padStart(2, '0')}-${String(entryDate.getDate()).padStart(2, '0')}`;
        if (!acc[dateKey]) {
          acc[dateKey] = { date: dateKey, data: [] };
        }
        acc[dateKey].data.push(entry);
        return acc;
      }, {});
  }, [dietData, formattedMonth]);

  React.useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [formattedMonth]);

  const formatDate = (date: Date) => {
    const day = date.getDate();
    const weekday = i18n.t(`media.weekdays.${date.toLocaleDateString('en-US', {weekday: 'long'}).toLowerCase()}`);
    const month = i18n.t(`media.months.${date.toLocaleDateString('en-US', {month: 'long'}).toLowerCase()}`);
    return `${weekday}, ${month} ${day}`;
  };

  if (Array.isArray(dietData) || !dietData[formattedMonth]?.length) {
    return null;
  }

  return (
    <>
      <ScrollView>
        {Object.values(groupedData).map((group, index) => (
          <View key={group.date}>
            <View style={styles.dateContainer}>
              <Surface style={styles.dateSurface} elevation={1}>
                <Text variant="titleLarge" style={styles.dateText}>
                  {formatDate(new Date(group.date))}
                </Text>
              </Surface>
            </View>
            <View style={styles.imagesParent}>
              {group.data.map((meal, i) => (
                <Animated.View
                  key={`${group.date}-${i}`}
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
                  <TouchableOpacity onPress={() => setSelectedImage(meal.meal_picture)}>
                    <Surface style={styles.card} elevation={2}>
                      <Image 
                        style={styles.image} 
                        source={{ uri: meal.meal_picture }}
                        resizeMode="cover"
                      />
                      <View style={styles.timeContainer}>
                        <Text variant="titleSmall" style={styles.timeText}>
                          {(() => {
                            const date = new Date(meal.date);
                            if (isNaN(date.getTime())) {
                              return '';
                            }
                            
                            const currentLang = i18n.locale as 'ar' | 'fr' | 'en';
                            
                            // Get time in 24h format first
                            const time24h = date.toLocaleTimeString('en-US', {
                              hour: '2-digit', 
                              minute: '2-digit',
                              hour12: false
                            });
                            
                            // Convert to 12h format and handle translations
                            const hour = parseInt(time24h.split(':')[0]);
                            const minutes = time24h.split(':')[1];
                            const hour12 = hour % 12 || 12;
                            const period = hour < 12 ? 'AM' : 'PM';
                            
                            const translations = {
                              'AM': {
                                'ar': 'ص',
                                'fr': 'AM',
                                'en': 'AM'
                              },
                              'PM': {
                                'ar': 'م',
                                'fr': 'PM',
                                'en': 'PM'
                              }
                            } as const;

                            const translatedPeriod = translations[period][currentLang];
                            const timeString = `${hour12}:${minutes}`;

                            if (currentLang === 'ar') {
                              return `${translatedPeriod} ${timeString}`;
                            }
                            
                            return `${timeString} ${translatedPeriod}`;
                          })()}
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