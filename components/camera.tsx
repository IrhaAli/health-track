import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Button, Pressable, PixelRatio, Dimensions } from "react-native";
import { useCameraPermissions } from "expo-camera";
import { Camera, CameraType } from "expo-camera/legacy";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { setHideCamera, setImageURI } from "@/store/cameraSlice";
import { setShowDialog } from "@/store/trackDialogSlice";

export default function AppCamera() {
    const showCamera = useSelector((state: RootState) => state.camera.showCamera)
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<Camera | null>(null);
    const [timer, setTimer] = useState("");
    const [cameraSide, setCameraSide] = useState(CameraType.back);
    const dispatch = useDispatch();
    const { width, height } = Dimensions.get('window');

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
        dispatch(setShowDialog())
    };

    return (
        <>
            {showCamera && (!permission ? (
                <View />
            ) : !permission.granted ? (
                <View>
                    <View>
                        <Text style={styles.message}>We need your permission to show the camera</Text>
                        <Button onPress={requestPermission} title="grant permission" />
                    </View>
                </View>
            ) : (
                <>
                    <Camera style={[{ height: '100%', width: '100%' }]} type={cameraSide} ref={cameraRef} autoFocus={false} focusDepth={0} focusable={true}>
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
                </>
            ))}
        </>
    )
}

const styles = StyleSheet.create({
    text: {
        fontSize: 24,
        fontWeight: "bold",
        color: "white",
    },
    buttonContainer: {
        flex: 1,
        flexDirection: "row",
        backgroundColor: "transparent",
        alignItems: 'flex-end',
        justifyContent: 'center'
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
