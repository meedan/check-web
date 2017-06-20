import React from 'react';
import { render } from 'react-dom';
import Root from 'app/components/Root';
import { createStore, applyMiddleware, compose } from 'redux';
import rootReducer from 'app/redux';
import thunk from 'redux-thunk';

window.storage = {
  set(key, value) {
    window.localStorage.setItem(key, value);
  },

  get(key, callback) {
    callback(this.getValue(key));
  },

  getValue(key) {
    return window.localStorage.getItem(key);
  },
};

const store = compose(applyMiddleware(thunk))(createStore)(rootReducer);

render(
  <Root store={store} />,
  document.getElementById('root'),
);
