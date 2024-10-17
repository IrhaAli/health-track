import { db } from '@/firebaseConfig';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getAuth } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { DietDataEntry, SleepDataEntry, TrackState, WaterDataEntry, WeightDataEntry } from "../types/track";

const initialState: TrackState = {
  currentDate: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`,
  currentMonth: { month: String(new Date().getMonth() + 1).padStart(2, "0"), year: String(new Date().getFullYear()) },
  waterData: {},
  sleepData: {},
  weightData: {},
  dietData: {},
  loadingTrackWaterData: true,
  loadingTrackDietData: true,
  loadingTrackSleepData: true,
  loadingTrackWeightData: true
};

// Fetch.
export const fetchWaterData = createAsyncThunk( // Fetch Water Data
  'track/fetchWaterData',
  async ({ month, year, userId }: { month: string; year: string; userId: string }, thunkAPI) => {
    const formattedMonth = `${year}-${month}`;
    const [firstDate, lastDate] = [
      new Date(Date.UTC(+year, +month - 1, 1)),
      new Date(Date.UTC(+year, +month, 0, 23, 59, 59, 999))
    ];

    const { track: { waterData } } = thunkAPI.getState() as { track: TrackState }; // Access the current state

    if (waterData[formattedMonth]) { return { formattedMonth, docData: waterData[formattedMonth] }; }

    try {
      const collectionData = query(
        collection(db, "water_tracking"),
        where("date", ">=", firstDate),
        where("date", "<=", lastDate),
        where("user_id", "==", userId)
      );

      const docSnap = await getDocs(collectionData);
      const docData: WaterDataEntry[] = docSnap.docs.map(item => ({
        id: item.id,
        date: item.data().date.toDate().toISOString(),
        intake_amount: item.data().intake_amount,
        user_id: item.data().user_id,
        waterType: item.data().waterType
      }));

      return { formattedMonth, docData };
    } catch (error: any) { return thunkAPI.rejectWithValue(error.message); }
  }
);

export const fetchSleepData = createAsyncThunk( // Fetch Sleep Data
  'track/fetchSleepData',
  async ({ month, year, userId }: { month: string; year: string; userId: string }, thunkAPI) => {
    const formattedMonth = `${year}-${month}`;
    const [firstDate, lastDate] = [
      new Date(Date.UTC(+year, +month - 1, 1)),
      new Date(Date.UTC(+year, +month, 0, 23, 59, 59, 999))
    ];

    const { track: { sleepData } } = thunkAPI.getState() as { track: TrackState }; // Access the current state

    if (sleepData[formattedMonth]) { return { formattedMonth, docData: sleepData[formattedMonth] }; }

    try {
      const collectionData = query(
        collection(db, "sleep_tracking"),
        where("wakeup_time", ">=", firstDate),
        where("wakeup_time", "<=", lastDate),
        where("user_id", "==", userId)
      );

      const docSnap = await getDocs(collectionData);
      const docData: SleepDataEntry[] = docSnap.docs.map(item => ({
        id: item.id,
        bed_time: item.data().bed_time.toDate().toISOString(),
        sleep_duration: item.data().sleep_duration,
        sleep_quality: item.data().sleep_quality,
        user_id: item.data().user_id,
        wakeup_time: item.data().wakeup_time.toDate().toISOString()
      }));

      return { formattedMonth, docData };
    } catch (error: any) { return thunkAPI.rejectWithValue(error.message); }
  }
);

export const fetchWeightData = createAsyncThunk( // Fetch Weight Data
  'track/fetchWeightData',
  async ({ month, year, userId }: { month: string; year: string; userId: string }, thunkAPI) => {
    const formattedMonth = `${year}-${month}`;
    const [firstDate, lastDate] = [
      new Date(Date.UTC(+year, +month - 1, 1)),
      new Date(Date.UTC(+year, +month, 0, 23, 59, 59, 999))
    ];

    const { track: { weightData } } = thunkAPI.getState() as { track: TrackState }; // Access the current state

    if (weightData[formattedMonth]) { return { formattedMonth, docData: weightData[formattedMonth] }; }

    try {
      const collectionData = query(
        collection(db, "weight_tracking"),
        where("date", ">=", firstDate),
        where("date", "<=", lastDate),
        where("user_id", "==", userId)
      );

      const docSnap = await getDocs(collectionData);
      const docData: WeightDataEntry[] = docSnap.docs.map(item => ({
        id: item.id,
        date: item.data().date.toDate().toISOString(),
        measurement_unit: item.data().measurement_unit,
        picture: item.data().picture,
        user_id: item.data().user_id,
        weight: item.data().weight
      }));

      return { formattedMonth, docData };
    } catch (error: any) { return thunkAPI.rejectWithValue(error.message); }
  }
);

export const fetchDietData = createAsyncThunk( // Fetch Diet Data
  'track/fetchDietData',
  async ({ month, year, userId }: { month: string; year: string; userId: string }, thunkAPI) => {
    const formattedMonth = `${year}-${month}`;
    const [firstDate, lastDate] = [
      new Date(Date.UTC(+year, +month - 1, 1)),
      new Date(Date.UTC(+year, +month, 0, 23, 59, 59, 999))
    ];

    const { track: { dietData } } = thunkAPI.getState() as { track: TrackState }; // Access the current state

    if (dietData[formattedMonth]) { return { formattedMonth, docData: dietData[formattedMonth] }; }

    try {
      const collectionData = query(
        collection(db, "diet_tracking"),
        where("date", ">=", firstDate),
        where("date", "<=", lastDate),
        where("user_id", "==", userId)
      );

      const docSnap = await getDocs(collectionData);
      const docData: DietDataEntry[] = docSnap.docs.map(item => ({
        id: item.id,
        date: item.data().date.toDate().toISOString(),
        meal_picture: item.data().meal_picture,
        user_id: item.data().user_id,
      }));

      return { formattedMonth, docData };
    } catch (error: any) { return thunkAPI.rejectWithValue(error.message); }
  }
);
// Fetch.

// Delete.
export const deleteWaterData = createAsyncThunk( // Delete Water Data.
  'track/deleteWaterData',
  async ({ docId, currentDate }: { docId: string; currentDate: string }, thunkAPI) => {
    const [year, month] = currentDate.split('-');
    const formattedMonth = `${year}-${month}`;
    const state = thunkAPI.getState() as { track: TrackState };
    const waterData = state.track.waterData?.[formattedMonth];

    if (Array.isArray(waterData) && waterData.length > 0) {
      const existingEntry = waterData.find(
        (entry) =>
          new Date(entry.date).toLocaleDateString().split('/').reverse().join('-') === currentDate &&
          entry.id === docId
      );

      if (existingEntry) {
        try {
          await deleteDoc(doc(db, "water_tracking", docId));
          const docData = waterData.filter(
            (entry) =>
              !(new Date(entry.date).toLocaleDateString().split('/').reverse().join('-') === currentDate &&
                entry.id === docId)
          );
          return { formattedMonth, docData };
        } catch (error: any) { return thunkAPI.rejectWithValue(error.message); }
      }
    }
    return { formattedMonth, docData: waterData || [] };
  }
);

export const deleteSleepData = createAsyncThunk( // Delete Sleep Data.
  'track/deleteSleepData',
  async ({ docId, currentDate }: { docId: string; currentDate: string }, thunkAPI) => {
    const [year, month] = currentDate.split('-');
    const formattedMonth = `${year}-${month}`;
    const state = thunkAPI.getState() as { track: TrackState };
    const sleepData = state.track.sleepData?.[formattedMonth];

    if (Array.isArray(sleepData) && sleepData.length > 0) {
      const existingEntry = sleepData.find(
        (entry) =>
          new Date(entry.wakeup_time).toLocaleDateString().split('/').reverse().join('-') === currentDate &&
          entry.id === docId
      );

      if (existingEntry) {
        try {
          await deleteDoc(doc(db, "sleep_tracking", docId));
          const docData = sleepData.filter(
            (entry) =>
              !(new Date(entry.wakeup_time).toLocaleDateString().split('/').reverse().join('-') === currentDate &&
                entry.id === docId)
          );
          return { formattedMonth, docData };
        } catch (error: any) { return thunkAPI.rejectWithValue(error.message); }
      }
    }
    return { formattedMonth, docData: sleepData || [] };
  }
);

export const deleteWeightData = createAsyncThunk( // Delete Weight Data.
  'track/deleteWeightData',
  async ({ docId, currentDate }: { docId: string; currentDate: string }, thunkAPI) => {
    const [year, month] = currentDate.split('-');
    const formattedMonth = `${year}-${month}`;
    const state = thunkAPI.getState() as { track: TrackState };
    const weightData = state.track.weightData?.[formattedMonth];

    if (Array.isArray(weightData) && weightData.length > 0) {
      const existingEntry = weightData.find(
        (entry) =>
          new Date(entry.date).toLocaleDateString().split('/').reverse().join('-') === currentDate &&
          entry.id === docId
      );

      if (existingEntry) {
        try {
          await deleteDoc(doc(db, "weight_tracking", docId));
          const docData = weightData.filter(
            (entry) =>
              !(new Date(entry.date).toLocaleDateString().split('/').reverse().join('-') === currentDate &&
                entry.id === docId)
          );
          return { formattedMonth, docData };
        } catch (error: any) { return thunkAPI.rejectWithValue(error.message); }
      }
    }
    return { formattedMonth, docData: weightData || [] };
  }
);

export const deleteDietData = createAsyncThunk( // Delete Diet Data.
  'track/deleteDietData',
  async ({ docId, currentDate }: { docId: string; currentDate: string }, thunkAPI) => {
    const [year, month] = currentDate.split('-');
    const formattedMonth = `${year}-${month}`;
    const state = thunkAPI.getState() as { track: TrackState };
    const dietData = state.track.dietData?.[formattedMonth];

    if (Array.isArray(dietData) && dietData.length > 0) {
      const existingEntry = dietData.find(
        (entry) =>
          new Date(entry.date).toLocaleDateString().split('/').reverse().join('-') === currentDate &&
          entry.id === docId
      );

      if (existingEntry) {
        try {
          await deleteDoc(doc(db, "diet_tracking", docId));
          const docData = dietData.filter(
            (entry) =>
              !(new Date(entry.date).toLocaleDateString().split('/').reverse().join('-') === currentDate &&
                entry.id === docId)
          );
          return { formattedMonth, docData };
        } catch (error: any) { return thunkAPI.rejectWithValue(error.message); }
      }
    }
    return { formattedMonth, docData: dietData || [] };
  }
);
// Delete.

// Add.
export const addWaterData = createAsyncThunk( // Add Water Data.
  'track/addWaterData',
  async ({ currentDate, addWater }: { currentDate: string, addWater: WaterDataEntry }, thunkAPI) => {
    const [year, month] = currentDate.split('-');
    const formattedMonth = `${year}-${month}`;
    const state = thunkAPI.getState() as { track: TrackState };
    const waterDataForMonth = state.track.waterData?.[formattedMonth] || [];

    const existingEntry = waterDataForMonth.find(
      entry => new Date(entry.date).toLocaleDateString().split('/').reverse().join('-') === currentDate
    );

    if (existingEntry) {
      return { formattedMonth, docData: waterDataForMonth };
    }

    try {
      const newWaterDocumentRef = await addDoc(collection(db, "water_tracking"), addWater);
      const newEntry = { ...addWater, id: newWaterDocumentRef.id, date: new Date(addWater.date).toISOString() };
      return { formattedMonth, docData: [...waterDataForMonth, newEntry] };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const addSleepData = createAsyncThunk( // Add Sleep Data.
  'track/addSleepData',
  async ({ currentDate, addSleep }: { currentDate: string, addSleep: SleepDataEntry }, thunkAPI) => {
    const [year, month] = currentDate.split('-');
    const formattedMonth = `${year}-${month}`;
    const state = thunkAPI.getState() as { track: TrackState };
    const sleepDataForMonth = state.track.sleepData?.[formattedMonth] || [];

    const existingEntry = sleepDataForMonth.find(
      entry => new Date(entry.wakeup_time).toLocaleDateString().split('/').reverse().join('-') === currentDate
    );

    if (existingEntry) {
      return { formattedMonth, docData: sleepDataForMonth };
    }

    try {
      const newSleepDocumentRef = await addDoc(collection(db, "sleep_tracking"), addSleep);
      const newEntry = { ...addSleep, id: newSleepDocumentRef.id, wakeup_time: new Date(addSleep.wakeup_time).toISOString(), bed_time: new Date(addSleep.bed_time).toISOString() };
      return { formattedMonth, docData: [...sleepDataForMonth, newEntry] };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const addWeightData = createAsyncThunk( // Add Weight Data.
  'track/addWeightData',
  async ({ currentDate, addWeight }: { currentDate: string, addWeight: WeightDataEntry }, thunkAPI) => {
    const [year, month] = currentDate.split('-');
    const formattedMonth = `${year}-${month}`;
    const state = thunkAPI.getState() as { track: TrackState };
    const weightDataForMonth = state.track.weightData?.[formattedMonth] || [];

    const existingEntry = weightDataForMonth.find(
      entry => new Date(entry.date).toLocaleDateString().split('/').reverse().join('-') === currentDate
    );

    if (existingEntry) { return { formattedMonth, docData: weightDataForMonth }; }

    try {
      const newWeightDocumentRef = await addDoc(collection(db, "weight_tracking"), addWeight);
      const newEntry = { ...addWeight, id: newWeightDocumentRef.id, date: new Date(addWeight.date).toISOString() };
      return { formattedMonth, docData: [...weightDataForMonth, newEntry] };
    } catch (error: any) { return thunkAPI.rejectWithValue(error.message); }
  }
);

export const addDietData = createAsyncThunk( // Add Diet Data.
  'track/addDietData',
  async ({ currentDate, addDiet }: { currentDate: string, addDiet: DietDataEntry }, thunkAPI) => {
    const [year, month] = currentDate.split('-');
    const formattedMonth = `${year}-${month}`;
    const state = thunkAPI.getState() as { track: TrackState };
    const dietDataForMonth = state.track.dietData?.[formattedMonth] || [];

    // const existingEntry = dietDataForMonth.find(
    //   entry => new Date(entry.date).toLocaleDateString().split('/').reverse().join('-') === currentDate
    // );

    // if (existingEntry) { return { formattedMonth, docData: dietDataForMonth }; }

    try {
      const newDietDocumentRef = await addDoc(collection(db, "diet_tracking"), addDiet);
      const newEntry = { ...addDiet, id: newDietDocumentRef.id, date: new Date(addDiet.date).toISOString() };
      return { formattedMonth, docData: [...dietDataForMonth, newEntry] };
    } catch (error: any) { return thunkAPI.rejectWithValue(error.message); }
  }
);
// Add.

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
    // Fetch
      .addCase(fetchWaterData.fulfilled, (state, action) => {   // Fetch Water Data
        const { formattedMonth, docData } = action.payload;
        state.waterData[formattedMonth] = docData;
        state.loadingTrackWaterData = false;
      })
      .addCase(fetchWaterData.rejected, (state, action) => {    // Fetch Water Data - Error
        console.error('Error fetching water data:', action.payload);
        state.loadingTrackWaterData = false;
      })
      .addCase(fetchSleepData.fulfilled, (state, action) => {   // Fetch Sleep Data
        const { formattedMonth, docData } = action.payload;
        state.sleepData[formattedMonth] = docData;
        state.loadingTrackSleepData = false;
      })
      .addCase(fetchSleepData.rejected, (state, action) => {    // Fetch Sleep Data - Error
        console.error('Error fetching sleep data:', action.payload);
        state.loadingTrackSleepData = false;
      })
      .addCase(fetchWeightData.fulfilled, (state, action) => {   // Fetch Weight Data
        const { formattedMonth, docData } = action.payload;
        state.weightData[formattedMonth] = docData;
        state.loadingTrackWeightData = false;
      })
      .addCase(fetchWeightData.rejected, (state, action) => {    // Fetch Weight Data - Error
        console.error('Error fetching sleep data:', action.payload);
        state.loadingTrackWeightData = false;
      })
      .addCase(fetchDietData.fulfilled, (state, action) => {   // Fetch Diet Data
        const { formattedMonth, docData } = action.payload;
        state.dietData[formattedMonth] = docData;
        state.loadingTrackDietData = false;
      })
      .addCase(fetchDietData.rejected, (state, action) => {    // Fetch Diet Data - Error
        console.error('Error fetching sleep data:', action.payload);
        state.loadingTrackDietData = false;
      })
      // Fetch

      // Delete
      .addCase(deleteWaterData.fulfilled, (state, action) => {  // Delete Water Data
        const { formattedMonth, docData } = action.payload;
        state.waterData[formattedMonth] = docData;
        state.loadingTrackWaterData = false;
      })
      .addCase(deleteWaterData.rejected, (state, action) => {   // Delete Water Data - Error
        console.error('Error deleting water data:', action.payload);
        state.loadingTrackWaterData = false;
      })
      .addCase(deleteSleepData.fulfilled, (state, action) => {  // Delete Sleep Data
        const { formattedMonth, docData } = action.payload;
        state.sleepData[formattedMonth] = docData;
        state.loadingTrackSleepData = false;
      })
      .addCase(deleteSleepData.rejected, (state, action) => {   // Delete Sleep Data - Error
        console.error('Error deleting water data:', action.payload);
        state.loadingTrackSleepData = false;
      })
      .addCase(deleteWeightData.fulfilled, (state, action) => {  // Delete Weight Data
        const { formattedMonth, docData } = action.payload;
        state.weightData[formattedMonth] = docData;
        state.loadingTrackWeightData = false;
      })
      .addCase(deleteWeightData.rejected, (state, action) => {   // Delete Weight Data - Error
        console.error('Error deleting water data:', action.payload);
        state.loadingTrackWeightData = false;
      })
      .addCase(deleteDietData.fulfilled, (state, action) => {  // Delete Diet Data
        const { formattedMonth, docData } = action.payload;
        state.dietData[formattedMonth] = docData;
        state.loadingTrackDietData = false;
      })
      .addCase(deleteDietData.rejected, (state, action) => {   // Delete Diet Data - Error
        console.error('Error deleting water data:', action.payload);
        state.loadingTrackDietData = false;
      })
      // Delete

      // Add
      .addCase(addWaterData.fulfilled, (state, action) => {  // Add Water Data
        const { formattedMonth, docData } = action.payload;
        state.waterData[formattedMonth] = docData;
        state.loadingTrackWaterData = false;
      })
      .addCase(addWaterData.rejected, (state, action) => {   // Add Water Data - Error
        console.error('Error adding water data:', action.payload);
        state.loadingTrackWaterData = false;
      })
      .addCase(addSleepData.fulfilled, (state, action) => {  // Add Sleep Data
        const { formattedMonth, docData } = action.payload;
        state.sleepData[formattedMonth] = docData;
        state.loadingTrackSleepData = false;
      })
      .addCase(addSleepData.rejected, (state, action) => {   // Add Sleep Data - Error
        console.error('Error adding water data:', action.payload);
        state.loadingTrackSleepData = false;
      })
      .addCase(addWeightData.fulfilled, (state, action) => {  // Add Weight Data
        const { formattedMonth, docData } = action.payload;
        state.weightData[formattedMonth] = docData;
        state.loadingTrackWeightData = false;
      })
      .addCase(addWeightData.rejected, (state, action) => {   // Add Weight Data - Error
        console.error('Error adding water data:', action.payload);
        state.loadingTrackWeightData = false;
      })
      .addCase(addDietData.fulfilled, (state, action) => {  // Add Diet Data
        const { formattedMonth, docData } = action.payload;
        state.dietData[formattedMonth] = docData;
        state.loadingTrackDietData = false;
      })
      .addCase(addDietData.rejected, (state, action) => {   // Add Diet Data - Error
        console.error('Error adding water data:', action.payload);
        state.loadingTrackDietData = false;
      })
      // Add
  }
});

export const { setCurrentDate, setCurrentMonth } = trackSlice.actions;
export default trackSlice.reducer;