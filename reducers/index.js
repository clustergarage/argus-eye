import {combineReducers} from 'redux';

import search from './search.js';
import fileTree from './file-tree.js';
import objectConfig from './object-config.js';
import watchers from './watchers.js';

const rootReducer = combineReducers({
  search,
  fileTree,
  objectConfig,
  watchers,
});

export default rootReducer;
