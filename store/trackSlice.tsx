import { db } from '@/firebaseConfig';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getAuth } from 'firebase/auth';
import { collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';

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

// Track Water.
export const fetchWaterData = createAsyncThunk(
  'track/fetchWaterData',
  async ({ month, year, userId }: { month: string; year: string; userId: string }, thunkAPI) => {
    const formattedMonth = `${year}-${month}`;
    const firstDate = new Date(Date.UTC(parseInt(year, 10), parseInt(month, 10) - 1, 1));
    const lastDate = new Date(Date.UTC(parseInt(year, 10), parseInt(month, 10), 0, 23, 59, 59, 999));
    const state = thunkAPI.getState() as { track: TrackState }; // Access the current state

    if (state.track.waterData[formattedMonth]) { return { formattedMonth, docData: state.track.waterData[formattedMonth] }; }

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

export const deleteWaterData = createAsyncThunk(
  'track/deleteWaterData',
  async ({ year, month, docId, currentDate }: { month: string, year: string, docId: string, currentDate: string }, thunkAPI) => {
    const formattedMonth = `${year}-${month}`;
    const state = thunkAPI.getState() as { track: TrackState }; // Access the current state

    if (
      !Array.isArray(state.track.waterData) &&
      formattedMonth in state.track.waterData &&
      state.track.waterData[formattedMonth] &&
      state.track.waterData[formattedMonth].length > 0
    ) {
      // Use map to create an array of promises
      const promises: any[] = state.track.waterData[formattedMonth].map(async (entry) => {
        if ((new Date(entry.date).toISOString().split('T')[0] === currentDate) && (entry.id === docId)) {
          try {
            await deleteDoc(doc(db, "water_tracking", docId));
            return null; // Return null for the entry to be removed
          } catch (error: any) {
            return thunkAPI.rejectWithValue(error.message);
          }
        }
        return entry; // Return the entry if it doesn't match
      });

      // Wait for all promises to resolve
      const results: WaterDataEntry[] = await Promise.all(promises);

      // Filter out the null values
      const newArray = results.filter((entry: WaterDataEntry) => entry !== null);
      return { formattedMonth, docData: newArray };
    }
    else { return { formattedMonth, docData: state.track.waterData[formattedMonth] }; }
  }
);
// Track Water.

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
      .addCase(fetchWaterData.fulfilled, (state, action) => {   // Fetch Water Data
        const { formattedMonth, docData } = action.payload;
        state.waterData[formattedMonth] = docData;
        state.loadingTrackWaterData = false;
      })
      .addCase(fetchWaterData.rejected, (state, action) => {    // Fetch Water Data - Error
        console.error('Error fetching water data:', action.payload);
        state.loadingTrackWaterData = false;
      })
      .addCase(deleteWaterData.fulfilled, (state, action) => {  // Delete Water Data
        const { formattedMonth, docData } = action.payload;
        state.waterData[formattedMonth] = docData;
        state.loadingTrackWaterData = false;
      })
      .addCase(deleteWaterData.rejected, (state, action) => {   // Delete Water Data - Error
        console.error('Error fetching water data:', action.payload);
        state.loadingTrackWaterData = false;
      })
  }
});

export const { setCurrentDate, setCurrentMonth } = trackSlice.actions;
export default trackSlice.reducer;