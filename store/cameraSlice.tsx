import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CounterState {
    showCamera: boolean;
    imageURI: any;
}

const initialState: CounterState = {
    showCamera: false,
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
        },
        setImageURI: (state, action: PayloadAction<string>) => {
            state.imageURI = action.payload;
        }
    },
});

export const { setShowCamera, setHideCamera, setImageURI } = counterSlice.actions;
export default counterSlice.reducer;