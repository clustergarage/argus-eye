import {createStore, applyMiddleware} from 'redux'
import {persistStore, persistReducer, persistCombineReducers} from 'redux-persist'
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2'
import storage from 'redux-persist/lib/storage'
import {composeWithDevTools} from 'redux-devtools-extension'
import thunkMiddleware from 'redux-thunk'

import rootReducer from '../reducers'

const makeConfiguredStore = (reducer, initialState) => {
  const isServer = !!(typeof window === 'undefined')
  return createStore(reducer, initialState,
    composeWithDevTools(applyMiddleware(thunkMiddleware)))
}

export default (initialState, {isServer}) => {
  if (isServer) {
    return makeConfiguredStore(rootReducer, initialState)
  } else {
    const persistConfig = {
      key: 'argus-eye',
      storage: storage,
      autoMergeLevel2,
      whitelist: ['search', 'fileTree', 'objectConfig'],
      blacklist: ['watchers'],
      debug: true,
    }

    const store = makeConfiguredStore(persistReducer(persistConfig, rootReducer), initialState)
    store.persistor = persistStore(store)
    return store
  }
}
