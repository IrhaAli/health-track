import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WaterDataEntry {
    date: string;
    intake_amount: number;
    user_id: string;
    waterType: string;
}

type WaterDataState = {
    [key: string]: WaterDataEntry[];
};

interface TrackState {
    currentDate: string;
    loadingTrackDate: boolean;
    currentMonth: { month: string; year: string; };
    waterData: WaterDataState | [];
}

const initialState: TrackState = {
    currentDate: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`,
    loadingTrackDate: true,
    currentMonth: { month: String(new Date().getMonth() + 1).padStart(2, "0"), year: String(new Date().getFullYear()) },
    waterData: []
};

const trackSlice = createSlice({
    name: 'track',
    initialState,
    reducers: {
        setCurrentDate: (state: TrackState, action: PayloadAction<string>) => {
            state.currentDate = action.payload;
        },
        setShowLoadingTrackDate: (state: TrackState, action: PayloadAction<string>) => {
            state.loadingTrackDate = true;
        },
        setHideLoadingTrackDate: (state: TrackState, action: PayloadAction<string>) => {
            state.loadingTrackDate = false;
        },
        setCurrentMonth: (state: TrackState, action: PayloadAction<{ month: string; year: string }>) => {
            state.currentMonth = action.payload;
        },
        pushWaterData: (state: TrackState, action: PayloadAction<WaterDataState>) => {
            state.waterData = { ...state.waterData, ...action.payload };
        }
    },
});

export const { setCurrentDate, setShowLoadingTrackDate, setHideLoadingTrackDate, setCurrentMonth, pushWaterData } = trackSlice.actions;
export default trackSlice.reducer;