import React from 'react';
import { render } from 'react-dom';
import Root from 'app/components/Root';
import { subscribe as pusherSubscribe, unsubscribe as pusherUnsubscribe, PusherContext } from 'app/pusher';
import { createStore, applyMiddleware, compose } from 'redux';
import rootReducer from 'app/redux';
import thunk from 'redux-thunk';
import { addLocaleData } from 'react-intl';
import locales from '../../../localization/translations/locales';

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

// TODO nix Redux. Every identifier after "=" on this next line makes no sense.
const store = compose(applyMiddleware(thunk))(createStore)(rootReducer, { app: { context: {} } });

let locale = navigator.languages || navigator.language || navigator.userLanguage || 'en';
if (locale.constructor === Array) {
  ([locale] = locale);
}
locale = locale.replace(/[-_].*$/, '');
if (locales.indexOf(locale) === -1) {
  locale = 'en';
}

const pusherContextValue = {
  subscribe: pusherSubscribe,
  unsubscribe: pusherUnsubscribe,
};

const callback = (translations) => {
  render(
    (
      <PusherContext.Provider value={pusherContextValue}>
        <Root store={store} translations={translations} locale={locale} />
      </PusherContext.Provider>
    ),
    document.getElementById('root'),
  );
};

if (locale === 'en') {
  callback({});
} else {
  Promise.all([
    import(
      /* webpackChunkName: "react-intl-[request]" */
      'react-intl/locale-data/' + locale
    ),
    import(
      /* webpackChunkName: "messages-[request]" */
      '../../../localization/translations/' + locale
    ),
  ]).then(([ localeDataModule, messagesModule ]) => {
    // https://medium.com/webpack/webpack-4-import-and-commonjs-d619d626b655
    const localeData = localeDataModule.default;
    const messages = messagesModule.default;
    addLocaleData(localeData);
    callback(messages);
  });
}
