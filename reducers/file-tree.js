const TOGGLE_VISIBILITY = 'TOGGLE_VISIBILITY'
const OPEN_DIRECTORY = 'OPEN_DIRECTORY'

const initialState = {
  isVisible: {},
  openedDirectories: {}
}

const reducer = (state = initialState, action) => {
  const newState = Object.assign({}, state)
  switch (action.type) {
    case TOGGLE_VISIBILITY:
      newState.isVisible = Object.assign({}, newState.isVisible)
      newState.isVisible[action.path] = !newState.isVisible[action.path]
      break
    case OPEN_DIRECTORY:
      newState.openedDirectories = Object.assign({}, newState.openedDirectories, {
        [action.path]: action.files,
      })
      break
    default:
      return state
  }
  return newState
}

export default reducer

export const toggleVisibility = path => ({type: TOGGLE_VISIBILITY, path})
export const openDirectory = (path, files) => ({type: OPEN_DIRECTORY, path, files})

export const mapState = state => ({
  isVisible: state.fileTree.isVisible,
  openedDirectories: state.fileTree.openedDirectories
})

export const mapDispatch = dispatch => ({
  toggleVisibility: path => dispatch(toggleVisibility(path)),
  dispatchOpenDirectory: (path, files) => dispatch(openDirectory(path, files))
})
