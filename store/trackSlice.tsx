import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WaterDataEntry {
    id: string;
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
    currentMonth: { month: string; year: string; };
    waterData: WaterDataState | [];
    loadingTrackWaterData: boolean;
    loadingTrackDietData: boolean;
    loadingTrackSleepData: boolean; 
    loadingTrackWeightData: boolean;
}

const initialState: TrackState = {
    currentDate: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`,
    currentMonth: { month: String(new Date().getMonth() + 1).padStart(2, "0"), year: String(new Date().getFullYear()) },
    waterData: [],
    loadingTrackWaterData: true,
    loadingTrackDietData: true,
    loadingTrackSleepData: true,
    loadingTrackWeightData: true
};

const trackSlice = createSlice({
    name: 'track',
    initialState,
    reducers: {
        setCurrentDate: (state: TrackState, action: PayloadAction<string>) => {
            state.currentDate = action.payload;
        },
        setCurrentMonth: (state: TrackState, action: PayloadAction<{ month: string; year: string }>) => {
            state.currentMonth = action.payload;
        },
        pushWaterData: (state: TrackState, action: PayloadAction<WaterDataState>) => {
            state.waterData = { ...state.waterData, ...action.payload };
        },
        setLoadingTrackWaterData: (state: TrackState, action: PayloadAction<boolean>) => {
            state.loadingTrackWaterData = action.payload;
        },
        setLoadingTrackDietData: (state: TrackState, action: PayloadAction<boolean>) => {
            state.loadingTrackDietData = action.payload;
        },
        setLoadingTrackSleepData: (state: TrackState, action: PayloadAction<boolean>) => {
            state.loadingTrackSleepData = action.payload;
        },
        setLoadingTrackWeightData: (state: TrackState, action: PayloadAction<boolean>) => {
            state.loadingTrackWeightData = action.payload;
        },
    },
});

export const { setCurrentDate, setCurrentMonth, pushWaterData } = trackSlice.actions;
export default trackSlice.reducer;