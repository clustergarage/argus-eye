const CREATE_SUBJECT = 'CREATE_SUBJECT'
const SET_SELECTOR = 'SET_SELECTOR'
const TOGGLE_SUBJECT_PATH = 'TOGGLE_SUBJECT_PATH'
const TOGGLE_SUBJECT_IGNORE = 'TOGGLE_SUBJECT_IGNORE'
const TOGGLE_RECURSIVE = 'TOGGLE_RECURSIVE'
const SET_MAX_DEPTH = 'SET_MAX_DEPTH'

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
    case TOGGLE_SUBJECT_IGNORE:
      index = newState.subjects.indexOf(action.subject)
      let arr = newState.subjects[index][action.key] || []
      const idx = arr.indexOf(action.value)
      if (idx > -1) {
        arr.splice(idx, 1)
      } else {
        arr.push(action.value)
      }
      newState.subjects = [
        ...newState.subjects.slice(0, index),
        newState.subjects[index] = Object.assign({}, newState.subjects[index], {
          [action.key]: arr,
        }),
        ...newState.subjects.slice(index + 1),
      ]
      break
    case TOGGLE_RECURSIVE:
      index = newState.subjects.indexOf(action.subject)
      newState.subjects[index].recursive = !newState.subjects[index].recursive
      break
    case SET_MAX_DEPTH:
      index = newState.subjects.indexOf(action.subject)
      newState.subjects[index].maxDepth = action.value
      break
    default:
      return state
  }
  return newState
}

export default reducer

export const createSubject = () => ({type: CREATE_SUBJECT})
export const setSelector = selector => ({type: SET_SELECTOR, selector})
export const toggleSubjectPath = (subject, value) => ({
  type: TOGGLE_SUBJECT_PATH,
  subject,
  key: 'paths',
  value,
})
export const toggleSubjectIgnore = (subject, value) => ({
  type: TOGGLE_SUBJECT_IGNORE,
  subject,
  key: 'ignore',
  value,
})
export const toggleRecursive = subject => ({type: TOGGLE_RECURSIVE, subject})
export const setMaxDepth = (subject, value) => ({type: SET_MAX_DEPTH, subject, value})

export const mapState = state => ({
  selector: state.objectConfig.selector,
  subjects: state.objectConfig.subjects,
})

export const mapDispatch = dispatch => ({
  dispatchCreateSubject: () => dispatch(createSubject()),
  dispatchSetSelector: selector => dispatch(setSelector(selector)),
  toggleSubjectPath: (subject, value) => dispatch(toggleSubjectPath(subject, value)),
  toggleSubjectIgnore: (subject, value) => dispatch(toggleSubjectIgnore(subject, value)),
  toggleRecursive: index => dispatch(toggleRecursive(index)),
  dispatchSetMaxDepth: (subject, value) => dispatch(setMaxDepth(subject, value)),
})
