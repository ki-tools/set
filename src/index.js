import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, compose, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { fetchData, windowResize } from './actions';

import './index.css';
import App from './App';
import reducers from './reducers';
// import registerServiceWorker from './registerServiceWorker';
import * as serviceWorker from './serviceWorker';

const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
  reducers,
  // { initial state... },
  composeEnhancer(applyMiddleware(thunkMiddleware, createLogger()))
);

if (process.env.NODE_ENV !== 'production') {
  if (module.hot) {
    module.hot.accept('./reducers', () => {
      store.replaceReducer(reducers);
    });
  }
}

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root'));

if (module.hot) {
  module.hot.accept('./App', () => {
    ReactDOM.render(
      <Provider store={store}>
        <App />
      </Provider>,
      document.getElementById('root'));
  });
}

// TODO: move this to the filtering components to call fetchData when filters are updated
// for now, while designing the vis components, this is a fixed source
store.dispatch(fetchData('testdata.json'));

store.dispatch(windowResize({
  height: window.innerHeight,
  width: window.innerWidth
}));

window.addEventListener('resize', () => {
  store.dispatch(windowResize({
    height: window.innerHeight,
    width: window.innerWidth
  }));
});

// registerServiceWorker();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
