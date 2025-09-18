// src/store/globalState.ts
import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the shape of your player state
export interface PlayerProps {
  address?: string;
  avatar: string;
  country: string;
  balance: number; // Add balance field for user's token balance
  bettedBalance: number;
  isUpPool: boolean;
  className?: string;
}

// Define the top-level state interface
export interface GlobalState {
  player: PlayerProps;
  isUpdate: boolean;
}

// Initial state adhering to GlobalState
const initialState: GlobalState = {
  player: {
    address: '',
    avatar: '',
    country: '',
    balance: 0, // Initialize balance to 0
    bettedBalance: 0,
    isUpPool: false,
    className: '',
  },
  isUpdate: false,
};

// Create a slice for global state
const globalSlice = createSlice({
  name: 'globalState',
  initialState,
  reducers: {
    setPlayer: (state, action: PayloadAction<PlayerProps>) => {
      state.player = action.payload;
    },
    setAvatar: (state, action: PayloadAction<string>) => {
      state.player.avatar = action.payload;
    },
    setCountry: (state, action: PayloadAction<string>) => {
      state.player.country = action.payload;
    },
    setIsUpdate: (state) => {
      state.isUpdate = !state.isUpdate;
    },
  },
});

// Export actions for use in components
export const { setPlayer, setAvatar, setCountry, setIsUpdate } = globalSlice.actions;

// Configure the Redux store
export const store = configureStore({
  reducer: {
    globalState: globalSlice.reducer,
  },
});

// Export RootState and AppDispatch types for use with useSelector/useDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// (Optional) Default export of reducer if you wish to import it elsewhere
export default globalSlice.reducer;
