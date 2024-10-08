import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Button } from "react-native";
import { useCameraPermissions } from "expo-camera";
import { Camera, CameraType } from "expo-camera/legacy";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { setHideCamera } from "@/store/cameraSlice";

interface AppCameraProps {
    setDialogStatus: (status: boolean) => void;
}

export default function AppCamera({ setDialogStatus }: AppCameraProps) {
    const showCamera = useSelector((state: RootState) => state.camera.showCamera)
    const [imageUri, setImageUri] = useState(null);
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<Camera | null>(null);
    const [timer, setTimer] = useState("");
    const [cameraSide, setCameraSide] = useState(CameraType.back);
    const dispatch = useDispatch();

    const toggleCameraFacing = () => {
        setCameraSide((current) =>
            current === CameraType.front ? CameraType.back : CameraType.front
        );
    };

    console.log('showCamera', showCamera);

    const takePhoto = async () => {
        const data: any = await cameraRef?.current?.takePictureAsync(undefined);
        setImageUri(data.uri);
        setTimer("");
        dispatch(setHideCamera());
        setDialogStatus(true);
    };

    return (
        <View>
            {showCamera &&
                (!permission ? (
                    <View />
                ) : !permission.granted ? (
                    <View style={styles.container}>
                        <View style={styles.cameraContainer}>
                            <Text style={styles.message}>We need your permission to show the camera</Text>
                            <Button onPress={requestPermission} title="grant permission" />
                        </View>
                    </View>
                ) : (
                    <View style={styles.container}>
                        <View style={styles.cameraContainer}>
                            <Camera style={styles.camera} type={cameraSide} ref={cameraRef}>
                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity style={styles.cameraButton} onPress={toggleCameraFacing}>
                                        <Text style={styles.text}>Flip Camera</Text>
                                        <Text style={styles.text}>{timer}</Text>
                                    </TouchableOpacity>

                                    <Button onPress={() => { dispatch(setHideCamera()); setDialogStatus(true); }} title="Cancel" />
                                    <Button onPress={takePhoto} title="Take Photo" />
                                </View>
                            </Camera>
                        </View>
                    </View>
                ))}
        </View>
    )
}

const styles = StyleSheet.create({
    text: {
        fontSize: 24,
        fontWeight: "bold",
        color: "white",
    },
    container: {
    },
    cameraContainer: {
        position: "absolute",
        // height: '100%',
        // width: '100%',
        // top: '-500%',
        left: 0,
        right: 0,
        bottom: 0,
        // top: 0,
        // flexDirection: 'row', 
        // alignContent: 'center', 
        // justifyContent: 'center'
    },
    camera: {
        // flex: 1,
    },
    buttonContainer: {
        flex: 1,
        flexDirection: "row",
        backgroundColor: "transparent",
        margin: 64,
    },
    message: {
        textAlign: "center",
        paddingBottom: 10,
    },
    cameraButton: {
        flex: 1,
        alignSelf: "flex-end",
        alignItems: "center",
    },
})