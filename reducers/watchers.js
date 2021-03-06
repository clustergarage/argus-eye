const SET_WATCHERS = 'SET_WATCHERS'
const CREATE_WATCHER = 'CREATE_WATCHER'
const UPDATE_WATCHER = 'UPDATE_WATCHER'
const DELETE_WATCHER = 'DELETE_WATCHER'

const initialState = {
  watchers: [],
}

const reducer = (state = initialState, action) => {
  const newState = Object.assign({}, state)
  switch (action.type) {
    case SET_WATCHERS:
      newState.watchers = action.watchers
      break
    case CREATE_WATCHER:
      newState.watchers = [
        ...newState.watchers,
        action.watcher,
      ]
      break
    case UPDATE_WATCHER:
      newState.watchers = [
        ...newState.watchers.slice(0, action.index),
        newState.watchers[action.index] = Object.assign({}, action.watcher),
        ...newState.watchers.slice(action.index + 1),
      ]
      break
    case DELETE_WATCHER:
      newState.watchers = [
        ...newState.watchers.slice(0, action.index),
        ...newState.watchers.slice(action.index + 1)
      ]
      break
    default:
      return state
  }
  return newState
}

export default reducer

export const setWatchers = watchers => ({type: SET_WATCHERS, watchers})
export const createWatcher = watcher => ({type: CREATE_WATCHER, watcher})
export const updateWatcher = (watcher, index) => ({type: UPDATE_WATCHER, watcher, index})
export const deleteWatcher = index => ({type: DELETE_WATCHER, index})

export const mapState = state => ({
  watchers: state.watchers.watchers,
})

export const mapDispatch = dispatch => ({
  dispatchSetWatchers: watchers => dispatch(setWatchers(watchers)),
  dispatchCreateWatcher: watcher => dispatch(createWatcher(watcher)),
  dispatchUpdateWatcher: (watcher, index) => dispatch(updateWatcher(watcher, index)),
  dispatchDeleteWatcher: index => dispatch(deleteWatcher(index)),
})
