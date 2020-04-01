import React from 'react';
import { render } from 'react-dom';
import Root from 'app/components/Root';
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

const store = compose(applyMiddleware(thunk))(createStore)(rootReducer);

let locale = navigator.languages || navigator.language || navigator.userLanguage || 'en';
if (locale.constructor === Array) {
  ([locale] = locale);
}
locale = locale.replace(/[-_].*$/, '');
if (locales.indexOf(locale) === -1) {
  locale = 'en';
}

const callback = (translations) => {
  render(
    <Root store={store} translations={translations} locale={locale} />,
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
  ]).then(([ localeData, messages ]) => {
    addLocaleData(localeData);
    callback(messages);
  });
}
