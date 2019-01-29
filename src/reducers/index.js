import { combineReducers } from 'redux';

import {
  SET_AGE_RANGE, SET_FOCUS_SCALE, REQUEST_DATA, RECEIVE_DATA,
  SET_FILTERS, SET_FILTER_OPEN, WINDOW_RESIZE, SET_EXPANDED, SET_PINNED, ui
} from '../constants';

const ageRange = (state = [39.99, 120], action) => {
  switch (action.type) {
    case SET_AGE_RANGE:
      return Object.assign([], [], action.val);
    default:
  }
  return state;
};

const timelineFocusScale = (state = () => {}, action) => {
  switch (action.type) {
    case SET_FOCUS_SCALE:
      return action.val;
    default:
  }
  return state;
};

const filters = (state = { ogm: ['Gastrointestinal', 'Genitourinary'], nd: [] }, action) => {
  switch (action.type) {
    case SET_FILTERS: {
      let newState = Object.assign({}, state);
      const { val, group, type } = action.data;
      if (type === 'toggle') {
        const idx = newState[group].indexOf(val);
        if (idx < 0) {
          newState[group].push(val);
        } else {
          newState[group].splice(idx, 1);
        }
      } else if (type === 'clear') {
        newState = { ogm: [], nd: [] };
      }
      return newState;
    }
    default:
  }
  return state;
};

const filterOpen = (state = false, action) => {
  switch (action.type) {
    case SET_FILTER_OPEN:
      return action.val;
    default:
  }
  return state;
};

// array of unique IDs
const expanded = (state = [], action) => {
  switch (action.type) {
    case SET_EXPANDED: {
      let newState = Object.assign([], state);
      if (action.data.what === 'add') {
        const ids = newState.map(d => d.uid);
        const rows = newState.map(d => d.row);
        if (ids.indexOf(action.data.val.uid) < 0) {
          newState.push(action.data.val);
        }
        // if one in that row already exists, need to remove it
        const idx = rows.indexOf(action.data.val.row);
        if (idx > -1 && newState[idx].row === action.data.val.row) {
          newState.splice(idx, 1);
        }
      } else if (action.data.what === 'clear') {
        newState = [];
      }
      return newState;
    }
    default:
  }
  return state;
};

const pinned = (state = [], action) => {
  switch (action.type) {
    case SET_PINNED: {
      const newState = Object.assign([], state);
      if (action.data.what === 'add') {
        const ids = newState.map(d => d.uid);
        if (ids.indexOf(action.data.val.uid) < 0) {
          // action.data.val.row = action.data.val.row.replace(/[a-zA-z]+-/, 'pinned-');
          newState.push(action.data.val);
        }
      }
      if (action.data.what === 'remove') {
        const ids = newState.map(d => d.uid);
        const idx = ids.indexOf(action.data.val.uid);
        if (idx > -1) {
          newState.splice(idx, 1);
        }
      }
      newState.sort((a, b) => ((a.xStart > b.xStart) ? 1 : -1));
      return newState;
    }
    default:
  }
  return state;
};

const windowSize = (state = {
  height: window.innerHeight,
  width: window.innerWidth,
  appWidth: Math.min(ui.maxWidth, window.innerWidth)
}, action) => {
  switch (action.type) {
    case WINDOW_RESIZE:
      return Object.assign({}, state, action.dims);
    default:
  }
  return state;
};

const timelineData = (state = {
  isFetching: false,
  isLoaded: false,
  didInvalidate: false,
  data: {}
}, action) => {
  switch (action.type) {
    case REQUEST_DATA:
      return Object.assign({}, state, {
        isFetching: true,
        isLoaded: false,
        didInvalidate: false
      });
    case RECEIVE_DATA:
      return Object.assign({}, state, {
        isFetching: false,
        didInvalidate: false,
        isLoaded: true,
        data: action.data,
        lastUpdated: action.receivedAt
      });
    default:
      return state;
  }
};

const reducers = combineReducers({
  ageRange,
  timelineFocusScale,
  filters,
  filterOpen,
  expanded,
  pinned,
  timelineData,
  windowSize
});

export default reducers;
