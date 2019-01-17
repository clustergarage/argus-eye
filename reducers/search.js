const SET_LABEL_SELECTOR = 'SET_LABEL_SELECTOR'
const SET_PODS = 'SET_PODS'
const SET_CONTAINERS = 'SET_CONTAINERS'
const SET_ROOT_DIRECTORY = 'SET_ROOT_DIRECTORY'
const SET_SELECTED_SUBJECT = 'SET_SELECTED_SUBJECT'
const CLEAR_SEARCH_STATE = 'CLEAR_SEARCH_STATE'

const initialState = {
  labelSelector: '',
  pods: [],
  containers: [],
  directory: '',
  selectedContainer: '',
  selectedSubject: null,
}

const reducer = (state = initialState, action) => {
  const newState = Object.assign({}, state)
  switch (action.type) {
    case SET_LABEL_SELECTOR:
      newState.labelSelector = action.selector
      break
    case SET_PODS:
      newState.pods = action.pods
      break
    case SET_CONTAINERS:
      newState.containers = action.containers
      break
    case SET_ROOT_DIRECTORY:
      newState.selectedContainer = action.cid
      newState.directory = action.directory
      break
    case SET_SELECTED_SUBJECT:
      newState.selectedSubject = action.index
      break
    case CLEAR_SEARCH_STATE:
      Object.assign(newState, {
        pods: [],
        containers: [],
        directory: '',
        selectedContainer: '',
        selectedSubject: null,
      })
      break
    default:
      return state
  }
  return newState
}

export default reducer

export const setLabelSelector = selector => ({type: SET_LABEL_SELECTOR, selector})
export const setPods = pods => ({type: SET_PODS, pods})
export const setContainers = containers => ({type: SET_CONTAINERS, containers})
export const setRootDirectory = (cid, directory) => ({type: SET_ROOT_DIRECTORY, cid, directory})
export const setSelectedSubject = index => ({type: SET_SELECTED_SUBJECT, index})
export const clearSearchState = () => ({type: CLEAR_SEARCH_STATE})

export const mapState = state => ({
  labelSelector: state.search.labelSelector,
  pods: state.search.pods,
  containers: state.search.containers,
  directory: state.search.directory,
  selectedContainer: state.search.selectedContainer,
  selectedSubject: state.search.selectedSubject,
})

export const mapDispatch = dispatch => ({
  dispatchSetLabelSelector: selector => dispatch(setLabelSelector(selector)),
  dispatchSetPods: pods => dispatch(setPods(pods)),
  dispatchSetContainers: containers => dispatch(setContainers(containers)),
  dispatchSetRootDirectory: (cid, directory) => dispatch(setRootDirectory(cid, directory)),
  dispatchSelectSubject: index => dispatch(setSelectedSubject(index)),
  dispatchClearSearchState: () => dispatch(clearSearchState()),
})
