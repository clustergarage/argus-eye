const SET_WATCHERS = 'SET_WATCHERS'

const initialState = {
  watchers: [],
}

const reducer = (state = initialState, action) => {
  const newState = Object.assign({}, state)
  switch (action.type) {
    case SET_WATCHERS:
      newState.watchers = action.watchers
      break
    default:
      return state
  }
  return newState
}

export default reducer

export const setWatchers = watchers => ({type: SET_WATCHERS, watchers})

export const mapState = state => ({
  watchers: state.watchers.watchers,
})

export const mapDispatch = dispatch => ({
  dispatchSetWatchers: watchers => dispatch(setWatchers(watchers)),
})
