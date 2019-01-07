import {combineReducers} from 'redux';

import search from './search.js';
import fileTree from './file-tree.js';
import objectConfig from './object-config.js';

const rootReducer = combineReducers({
  search,
  fileTree,
  objectConfig,
});

export default rootReducer;
