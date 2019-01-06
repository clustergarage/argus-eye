import {combineReducers} from 'redux';

import search from './search.js';
import fileTree from './file-tree.js';

const rootReducer = combineReducers({
  search,
  fileTree,
});

export default rootReducer;
