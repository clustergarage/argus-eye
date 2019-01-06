const LOAD_SELECTOR = 'LOAD_SELECTOR'
const LOAD_PODS = 'LOAD_PODS'
const LOAD_CONTAINERS = 'LOAD_CONTAINERS'
const LOAD_ROOT_DIRECTORY = 'LOAD_ROOT_DIRECTORY'

const initialState = {
  selector: '',
  pods: [],
  selectedPod: '',
  containers: [],
  selectedContainer: '',
  directory: '',
}

const reducer = (state = initialState, action) => {
  const newState = Object.assign({}, state)
  switch (action.type) {
    case LOAD_SELECTOR:
      newState.selector = action.selector
      break
    case LOAD_PODS:
      newState.pods = action.pods
      break
    case LOAD_CONTAINERS:
      newState.selectedPod = action.uid
      newState.containers = action.containers
      break
    case LOAD_ROOT_DIRECTORY:
      newState.selectedContainer = action.cid
      newState.directory = action.directory
      break
    default:
      return state
  }
  return newState
}

export default reducer

export const loadSelector = selector => ({type: LOAD_SELECTOR, selector})
export const loadPods = pods => ({type: LOAD_PODS, pods})
export const loadContainers = (uid, containers) => ({type: LOAD_CONTAINERS, uid, containers})
export const loadRootDirectory = (cid, directory) => ({type: LOAD_ROOT_DIRECTORY, cid, directory})

export const mapState = state => ({
  selector: state.search.selector,
  pods: state.search.pods,
  selectedPod: state.search.selectedPod,
  containers: state.search.containers,
  selectedContainer: state.search.selectedContainer,
  directory: state.search.directory,
})

export const mapDispatch = dispatch => ({
  dispatchLoadSelector: selector => dispatch(loadSelector(selector)),
  dispatchLoadPods: pods => dispatch(loadPods(pods)),
  dispatchLoadContainers: (uid, containers) => dispatch(loadContainers(uid, containers)),
  dispatchLoadRootDirectory: (cid, directory) => dispatch(loadRootDirectory(cid, directory)),
})
