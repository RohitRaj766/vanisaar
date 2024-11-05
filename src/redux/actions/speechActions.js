export const START_RECOGNITION = 'START_RECOGNITION';
export const STOP_RECOGNITION = 'STOP_RECOGNITION';
export const SET_TRANSCRIPTION = 'SET_TRANSCRIPTION';
export const SET_DEFINITION = 'SET_DEFINITION';
export const ADD_TALK_HISTORY = 'ADD_TALK_HISTORY';

export const startRecognition = () => ({ type: START_RECOGNITION });
export const stopRecognition = () => ({ type: STOP_RECOGNITION });
export const setTranscription = (text) => ({ type: SET_TRANSCRIPTION, payload: text });
export const setDefinition = (details) => ({ type: SET_DEFINITION, payload: details });
export const addTalkHistory = (talk) => ({ type: ADD_TALK_HISTORY, payload: talk });
