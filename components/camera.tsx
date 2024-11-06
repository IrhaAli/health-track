import React, { useRef, useState, useEffect } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity } from "react-native";
import { useCameraPermissions } from "expo-camera";
import { Camera, CameraType, AutoFocus } from "expo-camera/legacy";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { setHideCamera, setImageURI } from "@/store/cameraSlice";
import { Portal, Button, Avatar } from "react-native-paper";
import { useWindowDimensions } from "react-native";
import { useIsFocused } from '@react-navigation/native';

export default function AppCamera() {
    const showCamera = useSelector((state: RootState) => state.camera.showCamera)
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<Camera | null>(null);
    const [cameraSide, setCameraSide] = useState(CameraType.back);
    const dispatch = useDispatch<AppDispatch>();
    const { width, height: windowHeight } = useWindowDimensions();
    // Calculate camera height to maintain 16:9 aspect ratio
    const cameraHeight = Math.round((width * 16) / 9);
    const isFocused = useIsFocused();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (showCamera) {
            // Pre-warm the camera
            Camera.requestCameraPermissionsAsync();
        }
    }, [showCamera]);

    const toggleCameraFacing = () => {
        setCameraSide((current) =>
            current === CameraType.front ? CameraType.back : CameraType.front
        );
    };

    const handleFocus = async (event: any) => {
        // Remove focus handling since it's causing crashes
        return;
    };

    const takePhoto = async () => {
        if (!cameraRef.current || !isReady) {
            return;
        }

        try {
            const options = {
                quality: 0.8,
                base64: false,
                skipProcessing: true,
                exif: false,
                // Add these options to avoid the SortedSet error
                fastMode: true,
                fixOrientation: true
            };
            
            // Wrap in try-catch to handle potential null reference
            try {
                const data = await cameraRef.current.takePictureAsync(options);
                if (data?.uri) {
                    dispatch(setImageURI(data.uri));
                    handleCloseCamera();
                }
            } catch (err) {
                console.error("Error taking picture:", err);
                // Handle error gracefully
                handleCloseCamera();
            }
        } catch (error) {
            console.error("Error taking photo:", error);
        }
    };

    const handleCloseCamera = () => {
        setIsReady(false);
        dispatch(setHideCamera());
    };

    const onCameraReady = () => {
        setIsReady(true);
    };

    if (!permission) {
        return <View />;
    } else if (!permission.granted) {
        return (
            <View>
                <Text style={styles.message}>
                    We need your permission to show the camera
                </Text>
                <Button onPress={requestPermission}>Grant Permission</Button>
            </View>
        );
    } else if (isFocused && showCamera) {
        return (
            <Portal>
                <Modal 
                    animationType="fade"
                    transparent={false}
                    visible={showCamera}
                    presentationStyle="fullScreen"
                >
                    <View style={[styles.cameraContainer, { height: windowHeight }]}>
                        <View style={[styles.camera, { height: cameraHeight }]}>
                            <Camera 
                                style={StyleSheet.absoluteFill} 
                                type={cameraSide} 
                                ratio="16:9" 
                                ref={cameraRef}
                                onCameraReady={onCameraReady}
                                useCamera2Api={false} // Set to false to avoid Android native camera API issues
                                autoFocus={AutoFocus.on}
                            >
                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity 
                                        style={styles.button} 
                                        onPress={toggleCameraFacing}
                                    >
                                        <Avatar.Icon size={48} icon="camera-flip" color="#fff" style={styles.buttonIcon} />
                                    </TouchableOpacity>
                                    
                                    <TouchableOpacity 
                                        style={[styles.button, styles.captureButton]} 
                                        onPress={takePhoto}
                                        disabled={!isReady}
                                    >
                                        <Avatar.Icon size={64} icon="camera" color="#fff" style={styles.buttonIcon} />
                                    </TouchableOpacity>
                                    
                                    <TouchableOpacity 
                                        style={styles.button} 
                                        onPress={handleCloseCamera}
                                    >
                                        <Avatar.Icon size={48} icon="close" color="#fff" style={styles.buttonIcon} />
                                    </TouchableOpacity>
                                </View>
                            </Camera>
                        </View>
                    </View>
                </Modal>
            </Portal>
        );
    } else {
        return <View />;
    }
}

const styles = StyleSheet.create({
    cameraContainer: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
    },
    camera: {
        width: '100%',
        backgroundColor: '#000',
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 40,
        width: '100%',
        flexDirection: "row",
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    message: {
        textAlign: "center",
        paddingBottom: 10,
    },
    button: {
        padding: 10,
    },
    buttonIcon: {
        backgroundColor: 'transparent',
    },
    captureButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 50,
        padding: 15,
    }
})
