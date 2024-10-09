import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TrackState {
    currentDate: string;
    loadingTrackDate: boolean;
    currentMonth: { month: string; year: string; }
}

const initialState: TrackState = {
    currentDate: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`,
    loadingTrackDate: true,
    currentMonth: { month: String(new Date().getMonth() + 1).padStart(2, "0"), year: String(new Date().getFullYear()) }
};

const trackSlice = createSlice({
    name: 'camera',
    initialState,
    reducers: {
        setCurrentDate: (state, action: PayloadAction<string>) => {
            state.currentDate = action.payload;
        },
        setShowLoadingTrackDate: (state, action: PayloadAction<string>) => {
            state.loadingTrackDate = true;
        },
        setHideLoadingTrackDate: (state, action: PayloadAction<string>) => {
            state.loadingTrackDate = false;
        },
        setCurrentMonth: (state, action: PayloadAction<{month: string; year: string}>) => {
            state.currentMonth = action.payload;
        } 
    },
});

export const { setCurrentDate, setShowLoadingTrackDate, setHideLoadingTrackDate, setCurrentMonth } = trackSlice.actions;
export default trackSlice.reducer;