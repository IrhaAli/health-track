import { db } from '@/services/firebaseConfig';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
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

// Generic fetch function for tracking data with optimized query and caching
const fetchTrackingData = async <T extends { id: string }>(
  collectionName: string,
  firstDate: Date,
  lastDate: Date,
  userId: string,
  dateField: string,
  mapFunction: (item: any) => T
) => {
  const q = query(
    collection(db, collectionName),
    where(dateField, ">=", firstDate),
    where(dateField, "<=", lastDate),
    where("user_id", "==", userId)
  );

  const docSnap = await getDocs(q);
  return docSnap.docs.map(mapFunction);
};

// Helper function to create date range
const getDateRange = (year: string, month: string) => {
  const firstDate = new Date(Date.UTC(+year, +month - 1, 1));
  const lastDate = new Date(Date.UTC(+year, +month, 0, 23, 59, 59, 999));
  return [firstDate, lastDate];
};

// Generic fetch thunk creator
const createFetchThunk = <T extends { id: string }>(
  name: string,
  collectionName: string,
  dateField: string,
  mapFunction: (item: any) => T,
  dataSelector: (state: TrackState) => Record<string, T[]>
) => {
  return createAsyncThunk(
    `track/fetch${name}Data`,
    async ({ month, year, userId }: { month: string; year: string; userId: string }, thunkAPI) => {
      const formattedMonth = `${year}-${month}`;
      const [firstDate, lastDate] = getDateRange(year, month);

      const state = thunkAPI.getState() as { track: TrackState };
      const existingData = dataSelector(state.track)[formattedMonth];

      if (existingData) return { formattedMonth, docData: existingData };

      try {
        const docData = await fetchTrackingData<T>(
          collectionName,
          firstDate,
          lastDate,
          userId,
          dateField,
          mapFunction
        );
        return { formattedMonth, docData };
      } catch (error: any) {
        return thunkAPI.rejectWithValue(error.message);
      }
    }
  );
};

// Data mapping functions
const mappers = {
  water: (item: any) => ({
    id: item.id,
    date: item.data().date.toDate().toISOString(),
    intake_amount: item.data().intake_amount,
    user_id: item.data().user_id,
    waterType: item.data().waterType
  }),
  sleep: (item: any) => ({
    id: item.id,
    bed_time: item.data().bed_time.toDate().toISOString(),
    sleep_duration: item.data().sleep_duration,
    sleep_quality: item.data().sleep_quality,
    user_id: item.data().user_id,
    wakeup_time: item.data().wakeup_time.toDate().toISOString()
  }),
  weight: (item: any) => ({
    id: item.id,
    date: item.data().date.toDate().toISOString(),
    measurement_unit: item.data().measurement_unit,
    picture: item.data().picture,
    user_id: item.data().user_id,
    weight: item.data().weight
  }),
  diet: (item: any) => ({
    id: item.id,
    date: item.data().date.toDate().toISOString(),
    meal_picture: item.data().meal_picture,
    user_id: item.data().user_id,
  })
};

// Create fetch thunks
export const fetchWaterData = createFetchThunk<WaterDataEntry & { id: string }>(
  'Water', 'water_tracking', 'date', mappers.water,
  state => state.waterData as Record<string, (WaterDataEntry & { id: string })[]>
);

export const fetchSleepData = createFetchThunk<SleepDataEntry & { id: string }>(
  'Sleep', 'sleep_tracking', 'wakeup_time', mappers.sleep,
  state => state.sleepData as Record<string, (SleepDataEntry & { id: string })[]>
);

export const fetchWeightData = createFetchThunk<WeightDataEntry & { id: string }>(
  'Weight', 'weight_tracking', 'date', mappers.weight,
  state => state.weightData as Record<string, (WeightDataEntry & { id: string })[]>
);

export const fetchDietData = createFetchThunk<DietDataEntry & { id: string }>(
  'Diet', 'diet_tracking', 'date', mappers.diet,
  state => state.dietData as Record<string, (DietDataEntry & { id: string })[]>
);

// Generic delete helper
const deleteDataHelper = async (
  docId: string,
  currentDate: string,
  collectionName: string,
  data: any[],
  dateField: string
) => {
  if (!Array.isArray(data) || !data.length) return [];

  const existingEntry = data.find(entry => 
    new Date(entry[dateField]).toLocaleDateString().split('/').reverse().join('-') === currentDate &&
    entry.id === docId
  );

  if (!existingEntry) return data;

  try {
    await deleteDoc(doc(db, collectionName, docId));
    return data.filter(entry => 
      !(new Date(entry[dateField]).toLocaleDateString().split('/').reverse().join('-') === currentDate &&
        entry.id === docId)
    );
  } catch (error) {
    throw error;
  }
};

// Generic delete thunk creator
const createDeleteThunk = (name: string, collectionName: string, dateField: string) => {
  return createAsyncThunk(
    `track/delete${name}Data`,
    async ({ docId, currentDate }: { docId: string; currentDate: string }, thunkAPI) => {
      const [year, month] = currentDate.split('-');
      const formattedMonth = `${year}-${month}`;
      const state = thunkAPI.getState() as { track: TrackState };
      const dataKey = `${name.toLowerCase()}Data` as keyof TrackState;
      
      try {
        const docData = await deleteDataHelper(
          docId,
          currentDate,
          collectionName,
          (state.track[dataKey] as any)?.[formattedMonth],
          dateField
        );
        return { formattedMonth, docData };
      } catch (error: any) {
        return thunkAPI.rejectWithValue(error.message);
      }
    }
  );
};

// Create delete thunks
export const deleteWaterData = createDeleteThunk('Water', 'water_tracking', 'date');
export const deleteSleepData = createDeleteThunk('Sleep', 'sleep_tracking', 'wakeup_time');
export const deleteWeightData = createDeleteThunk('Weight', 'weight_tracking', 'date');
export const deleteDietData = createDeleteThunk('Diet', 'diet_tracking', 'date');
export const deleteWeightImage = createDeleteThunk('Weight', 'diet_tracking', 'date');

// Helper functions for add/update operations
const prepareMonthlyData = (currentDate: string, state: { track: TrackState }, dataKey: keyof TrackState) => {
  const [year, month] = currentDate.split('-');
  return {
    formattedMonth: `${year}-${month}`,
    dataForMonth: (state.track[dataKey] as any)?.[`${year}-${month}`] || []
  };
};

const findExistingEntry = (dataArray: any[], currentDate: string, dateField: string = 'date') => {
  return dataArray.find(entry => 
    new Date(entry[dateField]).toLocaleDateString().split('/').reverse().join('-') === currentDate
  );
};

// Generic add document helper
const addNewDocument = async (collectionName: string, data: any, dateFields: string[] = ['date']) => {
  const newDocRef = await addDoc(collection(db, collectionName), data);
  return { 
    ...data, 
    id: newDocRef.id,
    ...Object.fromEntries(
      dateFields.map(field => [field, new Date(data[field]).toISOString()])
    )
  };
};

// Generic add thunk creator
const createAddThunk = (name: string, collectionName: string, dateFields: string[] = ['date'], checkExisting = true) => {
  return createAsyncThunk(
    `track/add${name}Data`,
    async ({ currentDate, [`add${name}`]: addData }: { currentDate: string, [key: string]: any }, thunkAPI) => {
      const state = thunkAPI.getState() as { track: TrackState };
      const { formattedMonth, dataForMonth } = prepareMonthlyData(
        currentDate, 
        state, 
        `${name.toLowerCase()}Data` as keyof TrackState
      );

      if (checkExisting) {
        const existingEntry = findExistingEntry(dataForMonth, currentDate, dateFields[0]);
        if (existingEntry) return { formattedMonth, docData: dataForMonth };
      }

      try {
        const newEntry = await addNewDocument(collectionName, addData, dateFields);
        return { formattedMonth, docData: [...dataForMonth, newEntry] };
      } catch (error: any) {
        return thunkAPI.rejectWithValue(error.message);
      }
    }
  );
};

// Create add thunks
export const addWaterData = createAddThunk('Water', 'water_tracking');
export const addSleepData = createAddThunk('Sleep', 'sleep_tracking', ['wakeup_time', 'bed_time']);
export const addWeightData = createAddThunk('Weight', 'weight_tracking');
export const addDietData = createAddThunk('Diet', 'diet_tracking', ['date'], false);

// Generic update helper
const handleUpdateOperation = async (
  collectionName: string,
  updateData: any,
  dataForMonth: any[],
  dateTransforms?: { [key: string]: boolean }
) => {
  const { id, ...updateFields } = updateData;
  await updateDoc(doc(db, collectionName, id), updateFields);

  let processedData = { ...updateData };
  if (dateTransforms) {
    Object.entries(dateTransforms).forEach(([field, shouldTransform]) => {
      if (shouldTransform) {
        processedData[field] = (updateData[field] instanceof Date ? 
          updateData[field] : new Date(updateData[field])).toISOString();
      }
    });
  }

  const entryIndex = dataForMonth.findIndex(entry => entry.id === id);
  return entryIndex === -1 ? dataForMonth : [
    ...dataForMonth.slice(0, entryIndex),
    processedData,
    ...dataForMonth.slice(entryIndex + 1)
  ];
};

// Generic update thunk creator
const createUpdateThunk = (
  name: string, 
  collectionName: string, 
  dateField: string = 'date',
  dateTransforms?: { [key: string]: boolean }
) => {
  return createAsyncThunk(
    `track/update${name}Data`,
    async ({ currentDate, [`update${name}`]: updateData }: { currentDate: string, [key: string]: any }, thunkAPI) => {
      const { formattedMonth, dataForMonth } = prepareMonthlyData(
        currentDate, 
        thunkAPI.getState() as { track: TrackState }, 
        `${name.toLowerCase()}Data` as keyof TrackState
      );

      const existingEntry = findExistingEntry(dataForMonth, currentDate, dateField);
      if (!existingEntry || !updateData?.id) return { formattedMonth, docData: dataForMonth };

      try {
        const docData = await handleUpdateOperation(
          collectionName, 
          updateData, 
          dataForMonth, 
          dateTransforms
        );
        return { formattedMonth, docData };
      } catch (error: any) {
        return thunkAPI.rejectWithValue(error.message);
      }
    }
  );
};

// Create update thunks
export const updateWaterData = createUpdateThunk('Water', 'water_tracking');
export const updateWeightData = createUpdateThunk('Weight', 'weight_tracking');
export const updateDietData = createUpdateThunk('Diet', 'diet_tracking', 'date', { date: true });
export const updateSleepData = createUpdateThunk('Sleep', 'sleep_tracking', 'wakeup_time', {
  wakeup_time: true,
  bed_time: true
});

const trackSlice = createSlice({
  name: 'track',
  initialState,
  reducers: {
    setCurrentDate: (state: TrackState, action: PayloadAction<string>) => {
      state.currentDate = action.payload;
    },
    setCurrentMonth: (state: TrackState, action: PayloadAction<{ month: string; year: string }>) => {
      state.currentMonth = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
    // Helper function to handle loading states
    const setLoading = (state: TrackState, type: string, isLoading: boolean) => {
      const loadingKey = `loadingTrack${type}Data` as keyof TrackState;
      (state[loadingKey] as boolean) = isLoading;
    };

    // Helper function to handle data updates
    const updateStateData = (state: TrackState, type: string, formattedMonth: string, docData: any[]) => {
      const dataKey = `${type.toLowerCase()}Data` as keyof TrackState;
      (state[dataKey] as any)[formattedMonth] = docData;
    };

    // Helper function to handle errors
    const handleError = (state: TrackState, type: string, payload: any) => {
      console.error(`Error handling ${type} data:`, payload);
      setLoading(state, type as keyof TrackState, false);
    };

    // Generic case handler creator
    const createCaseHandlers = (type: string) => ({
      [`fetch${type}Data`]: {
        pending: (state: TrackState) => setLoading(state, type as keyof TrackState, true),
        fulfilled: (state: TrackState, { payload: { formattedMonth, docData } }: any) => {
          updateStateData(state, type, formattedMonth, docData);
          setLoading(state, type as keyof TrackState, false);
        },
        rejected: (state: TrackState, { payload }: any) => handleError(state, type, payload)
      },
      [`delete${type}Data`]: {
        pending: (state: TrackState) => setLoading(state, type as keyof TrackState, true),
        fulfilled: (state: TrackState, { payload: { formattedMonth, docData } }: any) => {
          updateStateData(state, type, formattedMonth, docData);
          setLoading(state, type as keyof TrackState, false);
        },
        rejected: (state: TrackState, { payload }: any) => handleError(state, type, payload)
      },
      [`add${type}Data`]: {
        pending: (state: TrackState) => setLoading(state, type as keyof TrackState, true),
        fulfilled: (state: TrackState, { payload: { formattedMonth, docData } }: any) => {
          updateStateData(state, type, formattedMonth, docData);
          setLoading(state, type as keyof TrackState, false);
        },
        rejected: (state: TrackState, { payload }: any) => handleError(state, type, payload)
      },
      [`update${type}Data`]: {
        pending: (state: TrackState) => setLoading(state, type as keyof TrackState, true),
        fulfilled: (state: TrackState, { payload: { formattedMonth, docData } }: any) => {
          updateStateData(state, type, formattedMonth, docData);
          setLoading(state, type as keyof TrackState, false);
        },
        rejected: (state: TrackState, { payload }: any) => handleError(state, type, payload)
      }
    });

    // Apply handlers for each data type
    ['Water', 'Sleep', 'Weight', 'Diet'].forEach(type => {
      const handlers = createCaseHandlers(type);
      Object.entries(handlers).forEach(([action, cases]) => {
        Object.entries(cases).forEach(([status, handler]) => {
          builder.addCase(
            `track/${action}/${status}` as any,
            handler as any
          );
        });
      });
    });
  }
});

export const { setCurrentDate, setCurrentMonth } = trackSlice.actions;
export default trackSlice.reducer;