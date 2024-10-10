import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
    userId: string | null;
    userData: string | null;
}

const initialState: UserState = {
    userId: null,
    userData: null
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUserId: (state, action: PayloadAction<string | null>) => {
            state.userId = action.payload;
        },
        setUser: (state, action: PayloadAction<string | null>) => {
            state.userData = action.payload;
        }, 
    },
});

export const { setUserId, setUser } = userSlice.actions;
export default userSlice.reducer;