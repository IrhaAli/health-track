import React, { useRef, useState, useEffect } from "react";
import { View, Text, StyleSheet, Modal } from "react-native";
import { useCameraPermissions } from "expo-camera";
import { Camera, CameraType } from "expo-camera/legacy";
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
    const { width } = useWindowDimensions();
    const height = Math.round((width * 16) / 9);
    const isFocused = useIsFocused();

    const toggleCameraFacing = () => {
        setCameraSide((current) =>
            current === CameraType.front ? CameraType.back : CameraType.front
        );
    };

    const takePhoto = async () => {
        if (cameraRef.current) {
            const data = await cameraRef.current.takePictureAsync();
            dispatch(setImageURI(data.uri));
            dispatch(setHideCamera());
        }
    };

    const handleCloseCamera = async () => {
        if (cameraRef.current) {
            await cameraRef.current.pausePreview();
            cameraRef.current = null;
        }
        setTimeout(() => {
            dispatch(setHideCamera());
        }, 300); // Delay to ensure smooth transition
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
                <Modal presentationStyle="overFullScreen" visible={showCamera}>
                    <View style={styles.cameraContainer}>
                        <Camera style={styles.camera} type={cameraSide} ratio="16:9" ref={cameraRef} >
                            <View style={styles.buttonContainer}>
                                <Button mode="text" onPress={toggleCameraFacing} theme={{ colors: { primary: 'white' } }} icon={({ size, color }) => (<Avatar.Icon size={48} icon="camera-flip" color="#fff" />)}>{''}</Button>
                                <Button mode="text" onPress={takePhoto} theme={{ colors: { primary: 'white' } }} icon={({ size, color }) => (<Avatar.Icon size={48} icon="camera" color="#fff" />)}>{''}</Button>
                                <Button mode="text" onPress={handleCloseCamera} theme={{ colors: { primary: 'white' } }} icon={({ size, color }) => (<Avatar.Icon size={48} icon="close" color="#fff" />)}>{''}</Button>
                            </View>
                        </Camera>
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
        height: '100%',
        width: '100%',
        backgroundColor: '#000',
        justifyContent: 'center',
    },
    camera: {
        width: '100%',
        height: '100%',
        alignSelf: 'center',
        zIndex: 999,
        backgroundColor: '#000',
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        flexDirection: "row",
        justifyContent: 'space-between',
        paddingBottom: 10,
    },
    message: {
        textAlign: "center",
        paddingBottom: 10,
    },
})
