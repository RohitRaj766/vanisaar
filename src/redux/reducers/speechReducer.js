import {
    START_RECOGNITION,
    STOP_RECOGNITION,
    SET_TRANSCRIPTION,
    SET_DEFINITION,
    ADD_TALK_HISTORY,
} from '../actions/speechActions';

const initialState = {
    isRecognizing: false,
    transcription: "",
    totalFetchedDetails: [],
    history: [],
};

const speechReducer = (state = initialState, action) => {
    switch (action.type) {
        case START_RECOGNITION:
            return { ...state, isRecognizing: true };
        case STOP_RECOGNITION:
            return { ...state, isRecognizing: false };
        case SET_TRANSCRIPTION:
            return { ...state, transcription: action.payload };
        case SET_DEFINITION:
            return {
                ...state,
                totalFetchedDetails: [...state.totalFetchedDetails, ...action.payload],
            };
        case ADD_TALK_HISTORY:
            return { ...state, history: [...state.history, action.payload] };
        default:
            return state;
    }
};

export default speechReducer;
