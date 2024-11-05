import { combineReducers } from 'redux';
import speechReducer from './reducers/speechReducer';

const rootReducer = combineReducers({
  speech: speechReducer,
});

export default rootReducer;
