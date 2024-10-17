import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TrackDialogState {
    showDialog: boolean;
    dialogType: string | null;
    dialogTab: string | null;
}

const initialState: TrackDialogState = {
    showDialog: false,
    dialogType: null, 
    dialogTab: null
};

const trackDialogSlice = createSlice({
    name: 'trackDialog',
    initialState,
    reducers: {
        setShowDialog: (state: TrackDialogState) => {
            state.showDialog = true;
        },
        setHideDialog: (state: TrackDialogState) => {
            state.showDialog = false;
        },
        setDialog: (state: TrackDialogState, action: PayloadAction<{ showDialog: boolean, dialogType?: string | null, dialogTab?: string | null }>) => {
            state.showDialog = action.payload.showDialog;
            if (action.payload.dialogType) { state.dialogType = action.payload.dialogType; }
            if (action.payload.dialogTab) { state.dialogTab = action.payload.dialogTab };
        },
        setTab: (state: TrackDialogState, action: PayloadAction<string>) => {
            state.dialogTab = action.payload
        }
    },
});

export const { setShowDialog, setHideDialog, setDialog, setTab } = trackDialogSlice.actions;
export default trackDialogSlice.reducer;