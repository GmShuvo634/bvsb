import { createSlice } from '@reduxjs/toolkit';

const tutorialState = createSlice({
  name: 'tutorialState',
  initialState: false,
  reducers: {
    setState: (state, payload) => payload.payload
  },
});
export const { setState } = tutorialState.actions;
export default tutorialState.reducer;