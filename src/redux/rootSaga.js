import { all } from 'redux-saga/effects';
import watchFetchWordData from './sagas/speechSaga';

export default function* rootSaga() {
  yield all([
    watchFetchWordData(),
  ]);
}