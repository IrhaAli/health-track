import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TrackState {
    currentDate: string;
}

const initialState: TrackState = {
    currentDate: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`
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