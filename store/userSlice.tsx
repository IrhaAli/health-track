import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
    userId: string;
    userData: string
}

const initialState: UserState = {
    userId: "",
    userData: ""
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUserId: (state, action: PayloadAction<string>) => {
            state.userId = action.payload;
        },
        setUser: (state, action: PayloadAction<string>) => {
            state.userData = action.payload;
        }, 
    },
});

export const { setUserId, setUser } = userSlice.actions;
export default userSlice.reducer;