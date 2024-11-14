import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum DialogTab {
    SLEEP = 'sleep',
    DIET = 'diet',
    WATER = 'water',
    WEIGHT = 'weight',
}

export enum DialogType {
    ADD = 'ADD',
    EDIT = 'EDIT',
}

interface TrackDialogState {
    showDialog: boolean;
    dialogType: DialogType | null;
    dialogTab: DialogTab | null;
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
        // Combine show/hide into single toggle action
        toggleDialog: (state: TrackDialogState, action: PayloadAction<boolean>) => {
            state.showDialog = action.payload;
        },
        
        // Optimized setDialog with destructuring and single update
        setDialog: (state: TrackDialogState, action: PayloadAction<{
            showDialog: boolean,
            dialogType?: DialogType | null,
            dialogTab?: DialogTab | null
        }>) => {
            const { showDialog, dialogType, dialogTab } = action.payload;
            state.showDialog = showDialog;
            if (dialogType !== undefined) state.dialogType = dialogType;
            if (dialogTab !== undefined) state.dialogTab = dialogTab;
        },

        // Simplified setTab
        setTab: (state: TrackDialogState, action: PayloadAction<DialogTab>) => {
            state.dialogTab = action.payload;
        }
    }
});

export const { toggleDialog, setDialog, setTab } = trackDialogSlice.actions;
export default trackDialogSlice.reducer;