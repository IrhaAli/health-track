import { setCurrentDate, setCurrentMonth } from "@/store/trackSlice";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo } from "react";
import { View, Text, StyleSheet, Animated, useColorScheme } from "react-native";
import { TouchableRipple } from "react-native-paper";
import { Colors } from "react-native/Libraries/NewAppScreen";
import { useDispatch } from "react-redux";
import { getLocales } from 'expo-localization';
import i18n from '@/i18n';
import { usePathname, useRouter } from "expo-router";

interface BottomTabBarProps {
    onIndexChange: (index: number) => void;
    currentIndex: number;
}

// Define routes without translations initially
const getRoutes = () => [
    { key: 'home', title: i18n.t('home'), icon: 'home', path: '/' },
    { key: 'track', title: i18n.t('track'), icon: 'clock', path: '/track' },
    { key: 'media', title: i18n.t('media.title'), icon: 'image', path: '/media' },
    { key: 'profile', title: i18n.t('profile'), icon: 'account', path: '/profile' },
];

// BottomTabBar component
export const BottomTabBar = React.memo(({ onIndexChange, currentIndex }: BottomTabBarProps) => {
    const colorScheme = useColorScheme();
    const slideAnim = React.useRef(new Animated.Value(0)).current;
    const dispatch = useDispatch();
    const pathname = usePathname();
    const router = useRouter();

    // Memoize routes with current translations
    const routes = useMemo(() => getRoutes(), [i18n.locale]);

    // Update currentIndex based on pathname
    useEffect(() => {
        const currentRoute = routes.findIndex(route => route.path === pathname);
        if (currentRoute !== -1 && currentRoute !== currentIndex) {
            onIndexChange(currentRoute);
        }
    }, [pathname, currentIndex, onIndexChange]);

    const handleIndexChange = useCallback((newIndex: number) => {
        Animated.spring(slideAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 100,
            friction: 10
        }).start(() => {
            slideAnim.setValue(0);
        });

        onIndexChange(newIndex);
        router.push(routes[newIndex].path);

        if (newIndex === 1) { // Only update date/month for Track tab
            const now = new Date();
            dispatch(setCurrentMonth({
                month: String(now.getMonth() + 1).padStart(2, "0"),
                year: String(now.getFullYear())
            }));
            dispatch(setCurrentDate(
                `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
            ));
        }
    }, [dispatch, slideAnim, onIndexChange, router]);

    return (
        <View style={[
            styles.tabBar,
            {
                backgroundColor: Colors[colorScheme ?? "light"].tint,
                flexDirection: 'row'
            }
        ]}>
            {routes.map((route, i) => (
                <TouchableRipple
                    key={route.key}
                    style={styles.tabItem}
                    onPress={() => handleIndexChange(i)}
                    rippleColor="rgba(0, 0, 0, .15)"
                    borderless={true}
                >
                    <View style={styles.tabItemContent}>
                        <MaterialCommunityIcons
                            name={route.icon as any}
                            size={24}
                            color={i === currentIndex ? 'tomato' : '#666666'}
                        />
                        <Text style={[
                            styles.tabText,
                            { color: i === currentIndex ? 'tomato' : '#666666' }
                        ]}>
                            {route.title}
                        </Text>
                    </View>
                </TouchableRipple>
            ))}
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    sceneContainer: {
        flex: 1,
        marginBottom: 60,
    },
    tabBar: {
        height: 60,
        elevation: 8,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    tabItem: {
        flex: 1,
    },
    tabItemContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabText: {
        fontSize: 12,
        marginTop: 4,
    }
});