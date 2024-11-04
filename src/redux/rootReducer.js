import { combineReducers } from 'redux';
import speechReducer from './reducers/speechReducer';

const rootReducer = combineReducers({
  speech: speechReducer,
  // Add other reducers here
});

export default rootReducer;
