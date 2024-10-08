import { configureStore } from '@reduxjs/toolkit';
import cameraReducer from './cameraSlice';
import trackDialogReducer from "./trackDialogSlice";

const store = configureStore({
  reducer: {
    camera: cameraReducer,
    trackDialog: trackDialogReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;