import React from 'react';
import { render } from 'react-dom';
import Root from 'app/containers/Root';
import configureStore from 'app/store/configureStore';

window.storage = {
  set: function(key, value) {
    window.localStorage.setItem(key, value);
  },

  get: function(key, callback) {
    var value = window.localStorage.getItem(key);
    callback(value);
  }
};

var url = document.location.search.replace(/^\?url=/, '');

configureStore(store => {
  var state = store.getState();
  state.extension.url = url;
  state.extension.runtime = {};

  render(
    <Root store={store} />,
    document.getElementById('root')
  );
}, undefined);
