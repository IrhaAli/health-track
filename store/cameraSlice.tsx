import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ActionCodeOperation } from 'firebase/auth';

interface CameraState {
    showCamera: boolean;
    imageURI: string | null;
}

const initialState: CameraState = {
    showCamera: false,
    imageURI: null
};

const cameraSlice = createSlice({
    name: 'camera',
    initialState,
    reducers: {
        setShowCamera: (state: CameraState) => {
            state.showCamera = true;
        },
        setHideCamera: (state: CameraState) => {
            state.showCamera = false;
        },
        setImageURI: (state: CameraState, action: PayloadAction<string>) => {
            state.imageURI = action.payload;
        },
        clearImageURI: (state: CameraState) => {
            state.imageURI = null;
        }
    },
});

export const { setShowCamera, setHideCamera, setImageURI, clearImageURI } = cameraSlice.actions;
export default cameraSlice.reducer;