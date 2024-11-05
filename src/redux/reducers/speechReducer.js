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
    singleFetchedDetails: [],
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
            // First, combine the current `totalFetchedDetails` and new `action.payload`
            const updatedTotalFetchedDetails = [
                ...state.totalFetchedDetails,
                ...action.payload
            ];

            // Now filter out duplicates by checking if the word already exists
            const uniqueTotalFetchedDetails = updatedTotalFetchedDetails.filter((item, index, self) =>
                index === self.findIndex((t) => t.word === item.word)  // Unique check based on 'word' property
            );

            return {
                ...state,
                singleFetchedDetails: action.payload,  // Store the fetched data
                totalFetchedDetails: uniqueTotalFetchedDetails,  // Store unique details only
            };

        case ADD_TALK_HISTORY:
            return { ...state, history: [...state.history, action.payload] };

        default:
            return state;
    }
};

export default speechReducer;
