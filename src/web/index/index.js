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

if (!global.Intl) {
  // eslint-disable-next-line max-len
  // eslint-disable-next-line import/no-dynamic-require, global-require, require-path-exists/tooManyArguments
  require(['intl'], (intl) => {
    global.Intl = intl;
    // TODO Commented out while build is not optimized for this!
    // eslint-disable-next-line global-require
    // require(`intl/locale-data/jsonp/${locale}.js`);
  });
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
  import(/* webpackChunkName: "[request]" */ `react-intl/locale-data/${locale}.js`).then((data) => {
    addLocaleData(data);
    import(/* webpackChunkName: "[request]" */ `../../../localization/translations/${locale}.js`).then((translations) => {
      callback(translations);
    });
  });
}
