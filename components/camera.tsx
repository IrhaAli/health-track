import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Button, Pressable, PixelRatio } from "react-native";
import { useCameraPermissions } from "expo-camera";
import { Camera, CameraType } from "expo-camera/legacy";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { setHideCamera } from "@/store/cameraSlice";
import { setShowDialog } from "@/store/trackDialogSlice";

export default function AppCamera() {
    const showCamera = useSelector((state: RootState) => state.camera.showCamera)
    const [imageUri, setImageUri] = useState(null);
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<Camera | null>(null);
    const [timer, setTimer] = useState("");
    const [cameraSide, setCameraSide] = useState(CameraType.back);
    const dispatch = useDispatch();
    const devicePixelRatio = PixelRatio.get();
    console.log('devicePixelRatio', devicePixelRatio);

    const toggleCameraFacing = () => {
        setCameraSide((current) =>
            current === CameraType.front ? CameraType.back : CameraType.front
        );
    };

    const takePhoto = async () => {
        const data: any = await cameraRef?.current?.takePictureAsync(undefined);
        setImageUri(data.uri);
        setTimer("");
        dispatch(setHideCamera());
        dispatch(setShowDialog())
    };

    return (
        <View>
            {showCamera && (!permission ? (
                    <View />
                ) : !permission.granted ? (
                    <View style={styles.container}>
                        <View style={styles.camera}>
                            <Text style={styles.message}>We need your permission to show the camera</Text>
                            <Button onPress={requestPermission} title="grant permission" />
                        </View>
                    </View>
                ) : (
                    <View style={styles.container}>
                            <Camera style={styles.camera} type={cameraSide} ref={cameraRef} ratio={'1:1'}>
                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity style={styles.cameraButton} onPress={toggleCameraFacing}>
                                        <Text style={styles.text}>Flip Camera</Text>
                                        <Text style={styles.text}>{timer}</Text>
                                    </TouchableOpacity>

                                    <Pressable onPress={() => { dispatch(setHideCamera()); dispatch(setShowDialog()) }}>
                                        <Text>CANCEL</Text>
                                    </Pressable>

                                    <Pressable onPress={takePhoto}>
                                        <Text>TAKE PHOTO</Text>
                                    </Pressable>
                                </View>
                            </Camera>
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
        flex: 1
    },
    camera: {
        // flex: 1,
        // position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: 772,
    },
    buttonContainer: {
        flex: 1,
        flexDirection: "row",
        backgroundColor: "transparent",
        // alignItems: 'flex-end',
        justifyContent: 'flex-start'
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
