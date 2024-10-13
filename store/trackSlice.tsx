import { db } from '@/firebaseConfig';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';

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
    waterData: WaterDataState;
    loadingTrackWaterData: boolean;
    loadingTrackDietData: boolean;
    loadingTrackSleepData: boolean; 
    loadingTrackWeightData: boolean;
}

const initialState: TrackState = {
    currentDate: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`,
    currentMonth: { month: String(new Date().getMonth() + 1).padStart(2, "0"), year: String(new Date().getFullYear()) },
    waterData: {},
    loadingTrackWaterData: true,
    loadingTrackDietData: true,
    loadingTrackSleepData: true,
    loadingTrackWeightData: true
};

export const fetchWaterData = createAsyncThunk(
  'track/fetchWaterData',
  async ({ month, year, userId }: { month: string; year: string; userId: string }, thunkAPI) => {
    const formattedMonth = `${year}-${month}`;
    const firstDate = new Date(Date.UTC(parseInt(year, 10), parseInt(month, 10) - 1, 1));
    const lastDate = new Date(Date.UTC(parseInt(year, 10), parseInt(month, 10), 0, 23, 59, 59, 999));
    const state = thunkAPI.getState() as { track: TrackState }; // Access the current state

    if (state.track.waterData[formattedMonth]) {
      // console.log(`Data for ${formattedMonth} already exists. Skipping fetch.`);
      return { formattedMonth, docData: state.track.waterData[formattedMonth] };
    }
    
    // console.log(`Data for ${formattedMonth} doesn't exists. Fetching...`);

    try {
      const collectionData = query(
        collection(db, "water_tracking"),
        where("date", ">=", firstDate),
        where("date", "<=", lastDate),
        where("user_id", "==", userId)
      );

      const docSnap = await getDocs(collectionData);
      const docData = docSnap.docs.map(item => ({
        id: item.id,
        date: item.data().date.toDate().toISOString(),
        intake_amount: item.data().intake_amount,
        user_id: item.data().user_id,
        waterType: item.data().waterType
      }));

      return { formattedMonth, docData };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

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
    extraReducers: (builder) => {
        builder
          .addCase(fetchWaterData.fulfilled, (state, action) => {
            const { formattedMonth, docData } = action.payload;
            state.waterData[formattedMonth] = docData;
            state.loadingTrackWaterData = false;
          })
          .addCase(fetchWaterData.rejected, (state, action) => {
            console.error('Error fetching water data:', action.payload);
            state.loadingTrackWaterData = false;
          });
    }
});

export const { setCurrentDate, setCurrentMonth, pushWaterData } = trackSlice.actions;
export default trackSlice.reducer;