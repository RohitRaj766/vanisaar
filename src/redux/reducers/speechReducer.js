import { START_RECOGNITION, STOP_RECOGNITION, SET_TRANSCRIPTION, SET_DEFINITION } from '../actions/speechActions';

const initialState = {
  isRecognizing: false,
  transcription: "",
  totalFetchedDetails:[]
};

const speechReducer = (state = initialState, action) => {
  switch (action.type) {
    case START_RECOGNITION:
      return { ...state, isRecognizing: true };
    case STOP_RECOGNITION:
      return { ...state, isRecognizing: false };
    case SET_TRANSCRIPTION:
        console.log("action.payload " + JSON.stringify(action.payload))
      return { ...state, transcription: action.payload };
    case SET_DEFINITION:
        console.log("Set definatnion " + JSON.stringify(action.payload))
      return {
        ...state,
        totalFetchedDetails: [...state.totalFetchedDetails, ...action.payload],
      };
    default:
      return state;
  }
};

export default speechReducer;
