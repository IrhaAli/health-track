import { configureStore } from '@reduxjs/toolkit';
import cameraReducer from './cameraSlice';
import trackDialogReducer from "./trackDialogSlice";
import userReducer from "./userSlice";
import trackReducer from "./trackSlice";

const store = configureStore({
  reducer: {
    camera: cameraReducer,
    trackDialog: trackDialogReducer,
    user: userReducer,
    track: trackReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;