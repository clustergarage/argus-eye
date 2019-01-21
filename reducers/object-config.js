import {tagsToObject, containsAll, containsNone} from '../util/util'

const SET_NAME = 'SET_NAME'
const SET_NAMESPACE = 'SET_NAMESPACE'
const CREATE_SUBJECT = 'CREATE_SUBJECT'
const DELETE_SUBJECT = 'DELETE_SUBJECT'
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

const VERSION = 'v0.1.0'
const API_VERSION = 'arguscontroller.clustergarage.io/v1alpha1'
const KIND = 'ArgusWatcher'

const EVENT_MAP = {
  close: ['closewrite', 'closenowrite'],
  move: ['movedfrom', 'movedto'],
  all: [
    'access', 'attrib', 'closewrite', 'closenowrite', 'close',
    'create', 'delete', 'deleteself', 'modify', 'moveself',
    'movedfrom', 'movedto', 'move', 'open',
  ],
}

const initialState = {
  apiVersion: API_VERSION,
  kind: KIND,
  metadata: {
    annotations: {
      'clustergarage.io/created-by': 'argus-eye',
      'clustergarage.io/argus-eye.version': VERSION,
    },
  },
  spec: {
    selector: {
      matchLabels: {}
    },
    subjects: [],
  }
}

const reducer = (state = initialState, action) => {
  const newState = Object.assign({}, state)
  const index = action.subject && newState.spec.subjects.indexOf(action.subject)

  switch (action.type) {
    case SET_NAME:
    case SET_NAMESPACE:
      newState.metadata[action.key] = action.value
      break
    case CREATE_SUBJECT:
      newState.spec.subjects = [...newState.spec.subjects, {
        paths: [],
        events: [],
      }]
      break
    case DELETE_SUBJECT:
      newState.spec.subjects = [
        ...newState.spec.subjects.slice(0, action.index),
        ...newState.spec.subjects.slice(action.index + 1)
      ]
      break
    case SET_SELECTOR:
      newState.spec.selector.matchLabels = tagsToObject(action.selector)
      break
    case TOGGLE_EVENT:
      let evtArr = newState.spec.subjects[index].events || []
      const evtIdx = evtArr.indexOf(action.value)
      if (evtIdx > -1) {
        evtArr.splice(evtIdx, 1)
      } else {
        evtArr.push(action.value)
      }

      const findEvtMapKeys = value => {
        let keys = []
        Object.keys(EVENT_MAP).forEach(key => {
          if (EVENT_MAP[key].indexOf(value) > -1) {
            keys.push(key)
          }
        })
        return keys
      }

      // if value is an event map key, toggle appropriate associated values
      if (evtArr[action.value]) {
        for (let i = 0; i < evtArr[action.value]; ++i) {
          if (evtIdx > -1) {
            // toggled off
            let assocIdx = evtArr.indexOf(evtArr[action.value][i])
            if (assocIdx > -1) {
              evtArr.splice(assocIdx, 1)
            }
          } else {
            // toggled on
            evtArr.push(evtArr[action.value][i])
          }
        }
      } else {
        // if value is an associated value, find event map keys
        const keys = findEvtMapKeys(action.value)
        for (let i = 0; i < keys.length; ++i) {
          if (evtIdx > -1) {
            // toggled off
            if (containsNone(evtArr, EVENT_MAP[keys[i]])) {
              // all associated values were removed
              let keyIdx = evtArr.indexOf(keys[i])
              evtArr.splice(keyIdx, 1)
            }
          } else {
            // toggled on
            if (containsAll(evtArr, EVENT_MAP[keys[i]])) {
              // all associated values were added
              evtArr.push(keys[i])
            }
          }
        }
      }

      newState.spec.subjects = [
        ...newState.spec.subjects.slice(0, index),
        newState.spec.subjects[index] = Object.assign({}, newState.spec.subjects[index], {
          events: evtArr,
        }),
        ...newState.spec.subjects.slice(index + 1),
      ]
      break
    case TOGGLE_SUBJECT_PATH:
    case TOGGLE_SUBJECT_IGNORE:
      let arr = newState.spec.subjects[index][action.key] || []
      let idx = arr.indexOf(action.value)
      if (idx > -1) {
        arr.splice(idx, 1)
      } else {
        arr.push(action.value)
      }
      newState.spec.subjects = [
        ...newState.spec.subjects.slice(0, index),
        newState.spec.subjects[index] = Object.assign({}, newState.spec.subjects[index], {
          [action.key]: arr,
        }),
        ...newState.spec.subjects.slice(index + 1),
      ]
      break
    case TOGGLE_RECURSIVE:
    case TOGGLE_ONLY_DIR:
    case TOGGLE_FOLLOW_MOVE:
      newState.spec.subjects[index][action.key] = !newState.spec.subjects[index][action.key]
      break
    case SET_MAX_DEPTH:
      newState.spec.subjects[index].maxDepth = action.value !== '' ?
        parseInt(action.value, 10) : undefined
      break
    case SET_TAGS:
      newState.spec.subjects[index].tags = action.value
      break
    case SET_LOG_FORMAT:
      newState.spec.logFormat = action.value
      break
    case CLEAR_CONFIG_STATE:
      Object.assign(newState.spec, {
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

export const setName = value => ({type: SET_NAME, key: 'name', value})
export const setNamespace = value => ({type: SET_NAMESPACE, key: 'namespace', value})
export const createSubject = () => ({type: CREATE_SUBJECT})
export const deleteSubject = index => ({type: DELETE_SUBJECT, index})
export const setSelector = selector => ({type: SET_SELECTOR, selector})
export const toggleEvent = (subject, value) => ({type: TOGGLE_EVENT, subject, value})
export const toggleSubjectPath = (subject, value) => ({type: TOGGLE_SUBJECT_PATH, subject, key: 'paths', value})
export const toggleSubjectIgnore = (subject, value) => ({type: TOGGLE_SUBJECT_IGNORE, subject, key: 'ignore', value})
export const toggleRecursive = subject => ({type: TOGGLE_RECURSIVE, subject, key: 'recursive'})
export const toggleOnlyDir = subject => ({type: TOGGLE_ONLY_DIR, subject, key: 'onlyDir'})
export const toggleFollowMove = subject => ({type: TOGGLE_FOLLOW_MOVE, subject, key: 'followMove'})
export const setMaxDepth = (subject, value) => ({type: SET_MAX_DEPTH, subject, value})
export const setTags = (subject, value) => ({type: SET_TAGS, subject, value})
export const setLogFormat = value => ({type: SET_LOG_FORMAT, value})
export const clearConfigState = () => ({type: CLEAR_CONFIG_STATE})

export const mapState = state => ({
  apiVersion: state.objectConfig.apiVersion,
  kind: state.objectConfig.kind,
  metadata: {
    annotations: state.objectConfig.metadata.annotations,
    name: state.objectConfig.metadata.name,
    namespace: state.objectConfig.metadata.namespace,
  },
  spec: {
    selector: state.objectConfig.spec.selector,
    subjects: state.objectConfig.spec.subjects,
    logFormat: state.objectConfig.spec.logFormat,
  },
})

export const mapDispatch = dispatch => ({
  dispatchSetName: value => dispatch(setName(value)),
  dispatchSetNamespace: value => dispatch(setNamespace(value)),
  dispatchCreateSubject: () => dispatch(createSubject()),
  dispatchDeleteSubject: index => dispatch(deleteSubject(index)),
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
