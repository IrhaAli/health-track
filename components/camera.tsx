import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, Modal } from "react-native";
import { useCameraPermissions } from "expo-camera";
import { Camera, CameraType } from "expo-camera/legacy";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { setHideCamera, setImageURI } from "@/store/cameraSlice";
import { Portal, Button, Avatar } from "react-native-paper";
import { useWindowDimensions } from "react-native";

export default function AppCamera() {
    const showCamera = useSelector((state: RootState) => state.camera.showCamera)
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<Camera | null>(null);
    const [timer, setTimer] = useState("");
    const [cameraSide, setCameraSide] = useState(CameraType.back);
    const dispatch = useDispatch<AppDispatch>();
    const { width } = useWindowDimensions();
    const height = Math.round((width * 16) / 9);

    const toggleCameraFacing = () => {
        setCameraSide((current) =>
            current === CameraType.front ? CameraType.back : CameraType.front
        );
    };

    const takePhoto = async () => {
        const data: any = await cameraRef?.current?.takePictureAsync(undefined);
        dispatch(setImageURI(data.uri));
        setTimer("");
        dispatch(setHideCamera());
    };

    return (
        <Portal>
            <Modal presentationStyle="overFullScreen" visible={showCamera}>
                {showCamera && (!permission ? (
                    <View />
                ) : !permission.granted ? (
                    <View>
                        <View>
                            <Text style={styles.message}>We need your permission to show the camera</Text>
                            <Button onPress={requestPermission} >grant permission</Button>
                        </View>
                    </View>
                ) : (
                    <View style={[{ height: '100%', width: '100%', backgroundColor: '#000', justifyContent: 'center' }]}>
                        <Camera style={[{ width: '100%', height, alignSelf: 'center', zIndex: 999, backgroundColor: '#000', justifyContent: 'flex-end' }]} type={cameraSide} ratio="16:9" ref={cameraRef} focusable={true} autoFocus={true}>
                            <View style={styles.buttonContainer}>
                                <Button mode="text" onPress={toggleCameraFacing} theme={{ colors: { primary: 'white' } }} icon={({ size, color }) => (<Avatar.Icon size={48} icon="camera-flip" color="#fff" />)}>{''}</Button>

                                <Button mode="text" onPress={takePhoto} theme={{ colors: { primary: 'white' } }} icon={({ size, color }) => (<Avatar.Icon size={48} icon="camera" color="#fff" />)}>{''}</Button>

                                <Button mode="text" onPress={() => { dispatch(setHideCamera()); }} theme={{ colors: { primary: 'white' } }} icon={({ size, color }) => (<Avatar.Icon size={48} icon="close" color="#fff" />)}>{''}</Button>
                            </View>
                        </Camera>
                    </View>
                ))}
            </Modal>
        </Portal>
    )
}

const styles = StyleSheet.create({
    buttonContainer: {
        width: '100%',
        flexDirection: "row",
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        alignSelf: 'flex-start',
        paddingBottom: 10
    },
    message: {
        textAlign: "center",
        paddingBottom: 10,
    },
})
