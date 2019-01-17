const CREATE_SUBJECT = 'CREATE_SUBJECT'
const SET_SELECTOR = 'SET_SELECTOR'
const TOGGLE_EVENT = 'TOGGLE_EVENT'
const TOGGLE_SUBJECT_PATH = 'TOGGLE_SUBJECT_PATH'
const TOGGLE_SUBJECT_IGNORE = 'TOGGLE_SUBJECT_IGNORE'
const TOGGLE_RECURSIVE = 'TOGGLE_RECURSIVE'
const TOGGLE_ONLY_DIR = 'TOGGLE_ONLY_DIR'
const TOGGLE_FOLLOW_MOVE = 'TOGGLE_FOLLOW_MOVE'
const SET_MAX_DEPTH = 'SET_MAX_DEPTH'
const SET_TAGS = 'SET_TAGS'
const SET_LOG_FORMAT = 'SET_LOG_FORMAT'
const CLEAR_CONFIG_STATE = 'CLEAR_CONFIG_STATE'

const initialState = {
  selector: {
    matchLabels: {}
  },
  subjects: [],
}

const reducer = (state = initialState, action) => {
  const newState = Object.assign({}, state)
  const index = action.subject && newState.subjects.indexOf(action.subject)

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
    case TOGGLE_EVENT:
    case TOGGLE_SUBJECT_PATH:
    case TOGGLE_SUBJECT_IGNORE:
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
    case TOGGLE_ONLY_DIR:
    case TOGGLE_FOLLOW_MOVE:
      newState.subjects[index][action.key] = !newState.subjects[index][action.key]
      break
    case SET_MAX_DEPTH:
    case SET_TAGS:
      newState.subjects[index][action.key] = action.value
      break
    case SET_LOG_FORMAT:
      newState.logFormat = action.value
      break
    case CLEAR_CONFIG_STATE:
      Object.assign(newState, {
        subjects: [],
        logFormat: null,
      })
      break
    default:
      return state
  }
  return newState
}

export default reducer

export const createSubject = () => ({type: CREATE_SUBJECT})
export const setSelector = selector => ({type: SET_SELECTOR, selector})
export const toggleEvent = (subject, value) => ({type: TOGGLE_EVENT, subject, event, key: 'events', value})
export const toggleSubjectPath = (subject, value) => ({type: TOGGLE_SUBJECT_PATH, subject, key: 'paths', value})
export const toggleSubjectIgnore = (subject, value) => ({type: TOGGLE_SUBJECT_IGNORE, subject, key: 'ignore', value})
export const toggleRecursive = subject => ({type: TOGGLE_RECURSIVE, subject, key: 'recursive'})
export const toggleOnlyDir = subject => ({type: TOGGLE_ONLY_DIR, subject, key: 'onlyDir'})
export const toggleFollowMove = subject => ({type: TOGGLE_FOLLOW_MOVE, subject, key: 'followMove'})
export const setMaxDepth = (subject, value) => ({type: SET_MAX_DEPTH, subject, key: 'maxDepth', value})
export const setTags = (subject, value) => ({type: SET_TAGS, subject, key: 'tags', value})
export const setLogFormat = value => ({type: SET_LOG_FORMAT, value})
export const clearConfigState = () => ({type: CLEAR_CONFIG_STATE})

export const mapState = state => ({
  selector: state.objectConfig.selector,
  subjects: state.objectConfig.subjects,
  logFormat: state.objectConfig.logFormat,
})

export const mapDispatch = dispatch => ({
  dispatchCreateSubject: () => dispatch(createSubject()),
  dispatchSetSelector: selector => dispatch(setSelector(selector)),
  toggleEvent: (subject, value) => dispatch(toggleEvent(subject, value)),
  toggleSubjectPath: (subject, value) => dispatch(toggleSubjectPath(subject, value)),
  toggleSubjectIgnore: (subject, value) => dispatch(toggleSubjectIgnore(subject, value)),
  toggleRecursive: index => dispatch(toggleRecursive(index)),
  toggleOnlyDir: subject => dispatch(toggleOnlyDir(subject)),
  toggleFollowMove: subject => dispatch(toggleFollowMove(subject)),
  dispatchSetMaxDepth: (subject, value) => dispatch(setMaxDepth(subject, value)),
  dispatchSetTags: (subject, value) => dispatch(setTags(subject, value)),
  dispatchSetLogFormat: value => dispatch(setLogFormat(value)),
  dispatchClearConfigState: () => dispatch(clearConfigState()),
})
