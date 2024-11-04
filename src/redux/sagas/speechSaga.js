import { call, put, takeLatest, delay } from 'redux-saga/effects';
import { SET_TRANSCRIPTION, setDefinition } from '../actions/speechActions';

function* fetchWordData(action) {
  const words = action.payload; // Expect an array of words
  console.log("words sagagagagag :: ", words)

  const allDetails = [];

  for (const word of words) {
  console.log("words dsasasdadaddadadadad :: ", word)

    let details = {
      word: word,
      definition: '',
      synonyms: [],
      antonyms: [],
    };

    try {
      const response = yield call(fetch, `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      const data = yield response.json();

      if (data[0]?.meanings[0]?.definitions[0]) {
        details.word = word;
        details.definition = data[0].meanings[0].definitions[0].definition || "No definition available";
        details.synonyms = data[0].meanings[0].definitions[0].synonyms || [];
        details.antonyms = data[0].meanings[0].definitions[0].antonyms || [];
      }

      allDetails.push(details);
      yield put(setDefinition([...allDetails])); // Update the UI with each word's details

      yield delay(200); // Delay to prevent API rate-limiting issues

    } catch (error) {
      console.error('Error fetching word data:', error);
    }
  }
}

function* watchFetchWordData() {
  yield takeLatest(SET_TRANSCRIPTION, fetchWordData);
}

export default watchFetchWordData;
