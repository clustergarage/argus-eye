const SET_LABEL_SELECTOR = 'SET_LABEL_SELECTOR'
const SET_PODS = 'SET_PODS'
const SET_CONTAINERS = 'SET_CONTAINERS'
const SET_ROOT_DIRECTORY = 'SET_ROOT_DIRECTORY'

const initialState = {
  labelSelector: '',
  pods: [],
  selectedPod: '',
  containers: [],
  selectedContainer: '',
  directory: '',
}

const reducer = (state = initialState, action) => {
  const newState = Object.assign({}, state)
  switch (action.type) {
    case SET_LABEL_SELECTOR:
      newState.labelSelector = action.labelSelector
      break
    case SET_PODS:
      newState.pods = action.pods
      break
    case SET_CONTAINERS:
      newState.selectedPod = action.uid
      newState.containers = action.containers
      break
    case SET_ROOT_DIRECTORY:
      newState.selectedContainer = action.cid
      newState.directory = action.directory
      break
    default:
      return state
  }
  return newState
}

export default reducer

export const setLabelSelector = selector => ({type: SET_LABEL_SELECTOR, selector})
export const setPods = pods => ({type: SET_PODS, pods})
export const setContainers = (uid, containers) => ({type: SET_CONTAINERS, uid, containers})
export const setRootDirectory = (cid, directory) => ({type: SET_ROOT_DIRECTORY, cid, directory})

export const mapState = state => ({
  labelSelector: state.search.labelSelector,
  pods: state.search.pods,
  selectedPod: state.search.selectedPod,
  containers: state.search.containers,
  selectedContainer: state.search.selectedContainer,
  directory: state.search.directory,
})

export const mapDispatch = dispatch => ({
  dispatchSetLabelSelector: selector => dispatch(setLabelSelector(selector)),
  dispatchSetPods: pods => dispatch(setPods(pods)),
  dispatchSetContainers: (uid, containers) => dispatch(setContainers(uid, containers)),
  dispatchSetRootDirectory: (cid, directory) => dispatch(setRootDirectory(cid, directory)),
})
