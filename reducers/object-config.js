const CREATE_SUBJECT = 'CREATE_SUBJECT'
const SET_SELECTOR = 'SET_SELECTOR'
const TOGGLE_SUBJECT_PATH = 'TOGGLE_SUBJECT_PATH'
const TOGGLE_SUBJECT_IGNORE = 'TOGGLE_SUBJECT_IGNORE'
const TOGGLE_RECURSIVE = 'TOGGLE_RECURSIVE'

const initialState = {
  selector: {
    matchLabels: {}
  },
  subjects: [],
}

const reducer = (state = initialState, action) => {
  const newState = Object.assign({}, state)
  let index

  switch (action.type) {
    case CREATE_SUBJECT:
      newState.subjects = [...newState.subjects, {
        paths: [],
        events: [],
      }]
      break
    case SET_SELECTOR:
      let labels = {}
      action.selector.replace(/([^=\,]+)=([^\,]*)/g, (_, k, v) => labels[k] = v)
      newState.selector.matchLabels = labels
      break
    case TOGGLE_SUBJECT_PATH:
      index = newState.subjects.indexOf(action.subject)
      let paths = newState.subjects[index].paths || []
      let pindex = paths.indexOf(action.path)
      if (pindex > -1) {
        paths.splice(pindex, 1)
      } else {
        paths.push(action.path)
      }
      newState.subjects = [
        ...newState.subjects.slice(0, index),
        newState.subjects[index] = Object.assign({}, newState.subjects[index], {paths}),
        ...newState.subjects.slice(index + 1),
      ]
      break
    case TOGGLE_SUBJECT_IGNORE:
      index = newState.subjects.indexOf(action.subject)
      let ignore = newState.subjects[index].ignore || []
      let iindex = ignore.indexOf(action.name)
      if (iindex > -1) {
        ignore.splice(iindex, 1)
      } else {
        ignore.push(action.name)
      }
      newState.subjects = [
        ...newState.subjects.slice(0, index),
        newState.subjects[index] = Object.assign({}, newState.subjects[index], {ignore}),
        ...newState.subjects.slice(index + 1),
      ]
      break
    case TOGGLE_RECURSIVE:
      index = newState.subjects.indexOf(action.subject)
      newState.subjects[index].recursive = !newState.subjects[index].recursive
      break
    default:
      return state
  }
  return newState
}

export default reducer

export const createSubject = () => ({type: CREATE_SUBJECT})
export const setSelector = selector => ({type: SET_SELECTOR, selector})
export const toggleSubjectPath = (subject, path) => ({type: TOGGLE_SUBJECT_PATH, subject, path})
export const toggleSubjectIgnore = (subject, name) => ({type: TOGGLE_SUBJECT_IGNORE, subject, name})
export const toggleRecursive = subject => ({type: TOGGLE_RECURSIVE, subject})

export const mapState = state => ({
  selector: state.objectConfig.selector,
  subjects: state.objectConfig.subjects,
})

export const mapDispatch = dispatch => ({
  dispatchCreateSubject: () => dispatch(createSubject()),
  dispatchSetSelector: selector => dispatch(setSelector(selector)),
  toggleSubjectPath: (subject, path) => dispatch(toggleSubjectPath(subject, path)),
  toggleSubjectIgnore: (subject, name) => dispatch(toggleSubjectIgnore(subject, name)),
  toggleRecursive: index => dispatch(toggleRecursive(index)),
})
