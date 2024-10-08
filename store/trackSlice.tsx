import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TrackState {
    currentDate: string;
}

const initialState: TrackState = {
    currentDate: ''
};

const trackSlice = createSlice({
    name: 'camera',
    initialState,
    reducers: {
        setCurrentDate: (state, action: PayloadAction<string>) => {
            state.currentDate = action.payload;
        }
    },
});

export const { setCurrentDate } = trackSlice.actions;
export default trackSlice.reducer;