import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TrackDialogState {
    showDialog: boolean;
}

const initialState: TrackDialogState = {
    showDialog: false
};

const trackDialogSlice = createSlice({
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

export const { setShowDialog, setHideDialog } = trackDialogSlice.actions;
export default trackDialogSlice.reducer;