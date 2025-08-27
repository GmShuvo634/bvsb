import { combineReducers } from '@reduxjs/toolkit';
import tutorialReducer from './tutorialSlice';
import globalState from './globalState';

const rootReducer = combineReducers({
  tutorialState: tutorialReducer,
  globalState: globalState,
});
export default rootReducer;