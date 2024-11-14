import React, { useRef, useState, useEffect } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { setHideCamera, setImageURI } from "@/store/cameraSlice";
import { Portal, Button, Avatar } from "react-native-paper";
import { useWindowDimensions } from "react-native";
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

export default function AppCamera() {
    const showCamera = useSelector((state: RootState) => state.camera.showCamera)
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<any>(null);
    const [facing, setFacing] = useState<CameraType>('back');
    const dispatch = useDispatch<AppDispatch>();
    const { width, height: windowHeight } = useWindowDimensions();
    // Calculate camera height to maintain 16:9 aspect ratio
    const cameraHeight = Math.round((width * 16) / 9);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (showCamera) {
            // Pre-warm the camera
            requestPermission();
        }
    }, [showCamera]);

    const toggleCameraFacing = () => {
        setFacing(current => current === 'back' ? 'front' : 'back');
    };

    // Remove focus handling since it's not supported in expo-camera
    const handleFocus = () => {
        // No-op since focus is not supported
    };

    const takePhoto = async () => {
        if (!cameraRef.current || !isReady) {
            return;
        }

        try {
            // Disable camera before taking picture to prevent race conditions
            setIsReady(false);
            
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.5,
                skipProcessing: true,
                exif: false,
            });
            
            if (photo?.uri) {
                // Compress and resize the image
                const manipulatedImage = await manipulateAsync(
                    photo.uri,
                    [
                        { resize: { width: 800 } } // Resize to max width of 800px while maintaining aspect ratio
                    ],
                    {
                        compress: 0.7, // 70% quality
                        format: SaveFormat.JPEG
                    }
                );

                dispatch(setImageURI(manipulatedImage.uri));
                handleCloseCamera();
            } else {
                throw new Error('No image uri returned');
            }

        } catch (error) {
            console.error("Error taking photo:", error);
            // Always close camera on error to prevent getting stuck
            handleCloseCamera();
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
    } else if (showCamera) {
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
                            <CameraView 
                                style={StyleSheet.absoluteFill} 
                                facing={facing}
                                ref={cameraRef}
                                onCameraReady={onCameraReady}
                                onTouchEnd={handleFocus}
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
                            </CameraView>
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
