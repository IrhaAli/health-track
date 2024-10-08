import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CounterState {
    showDialog: boolean;
}

const initialState: CounterState = {
    showDialog: false
};

const counterSlice = createSlice({
    name: 'trackDialog',
    initialState,
    reducers: {
        setShowDialog: (state) => {
            state.showDialog = true;
        },
        setHideDialog: (state) => {
            state.showDialog = false;
        }
    },
});

export const { setShowDialog, setHideDialog } = counterSlice.actions;
export default counterSlice.reducer;