import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CameraState {
    showCamera: boolean;
    imageURI: any;
}

const initialState: CameraState = {
    showCamera: false,
    imageURI: null
};

const cameraSlice = createSlice({
    name: 'camera',
    initialState,
    reducers: {
        setShowCamera: (state) => {
            state.showCamera = true;
        },
        setHideCamera: (state) => {
            state.showCamera = false;
        },
        setImageURI: (state, action: PayloadAction<string>) => {
            state.imageURI = action.payload;
        }
    },
});

export const { setShowCamera, setHideCamera, setImageURI } = cameraSlice.actions;
export default cameraSlice.reducer;