const CREATE_SUBJECT = 'CREATE_SUBJECT'
const SET_SELECTOR = 'SET_SELECTOR'
const TOGGLE_SUBJECT_PATH = 'TOGGLE_SUBJECT_PATH'

const initialState = {
  selector: {
    matchLabels: {}
  },
  subjects: [],
}

const reducer = (state = initialState, action) => {
  const newState = Object.assign({}, state)
  switch (action.type) {
    case CREATE_SUBJECT:
      newState.subjects = [...newState.subjects, {}]
      break
    case SET_SELECTOR:
      let selection = {}
      action.selector.replace(/([^=\,]+)=([^\,]*)/g, (_, k, v) => selection[k] = v)
      newState.selector.matchLabels = selection
      break
    case TOGGLE_SUBJECT_PATH:
      newState.subjects = [
        ...newState.subjects.slice(0, action.index),
        newState.subjects[action.index] = Object.assign({}, newState.subjects[action.index], {
          [action.path]: !newState.subjects[action.index][action.path],
        }),
        ...newState.subjects.slice(action.index + 1),
      ]
      break
    default:
      return state
  }
  return newState
}

export default reducer

export const createSubject = () => ({type: CREATE_SUBJECT})
export const setSelector = selector => ({type: SET_SELECTOR, selector})
export const toggleSubjectPath = (index, path) => ({type: TOGGLE_SUBJECT_PATH, index, path})

export const mapState = state => ({
  selector: state.objectConfig.selector,
  subjects: state.objectConfig.subjects,
})

export const mapDispatch = dispatch => ({
  dispatchCreateSubject: () => dispatch(createSubject()),
  dispatchSetSelector: selector => dispatch(setSelector(selector)),
  toggleSubjectPath: (index, path) => dispatch(toggleSubjectPath(index, path)),
})
