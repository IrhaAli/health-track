import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CounterState {
    showCamera: boolean;
    imageURI: any;
}

const initialState: CounterState = {
    showCamera: true,
    imageURI: null
};

const counterSlice = createSlice({
    name: 'camera',
    initialState,
    reducers: {
        setShowCamera: (state) => {
            state.showCamera = true;
        },
        setHideCamera: (state) => {
            state.showCamera = false;
        }
    },
});

export const { setShowCamera, setHideCamera } = counterSlice.actions;
export default counterSlice.reducer;