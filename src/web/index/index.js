import React from 'react';
import { render } from 'react-dom';
import Root from 'app/containers/Root';
import { createStore, applyMiddleware, compose } from 'redux';
import rootReducer from 'app/reducers';
import thunk from 'redux-thunk';

window.storage = {
  set: function(key, value) {
    window.localStorage.setItem(key, value);
  },

  get: function(key, callback) {
    callback(this.getValue(key));
  },

  getValue: function(key) {
    return window.localStorage.getItem(key);
  }
};

const store = compose(applyMiddleware(thunk))(createStore)(rootReducer);

render(
  <Root store={store} />,
  document.getElementById('root')
);
