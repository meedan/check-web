import React from 'react';
import { render } from 'react-dom';
import { addLocaleData } from 'react-intl';
import { createStore, applyMiddleware, compose } from 'redux';
import { ThemeProvider } from 'styled-components';
import { Helmet } from 'react-helmet';
import rtlDetect from 'rtl-detect';
import thunk from 'redux-thunk';
import { create as jssCreate } from 'jss';
import rtl from 'jss-rtl';
import {
  StylesProvider,
  MuiThemeProvider,
  createMuiTheme,
  jssPreset,
} from '@material-ui/core/styles';
import Root from '../../app/components/Root';
import { MuiTheme } from '../../app/styles/js/shared';
import { FlashMessageProvider } from '../../app/components/FlashMessage';
import { subscribe as pusherSubscribe, unsubscribe as pusherUnsubscribe, PusherContext } from '../../app/pusher';
import { ClientSessionIdContext, generateRandomClientSessionId } from '../../app/ClientSessionId';
import rootReducer from '../../app/redux';
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

const clientSessionId = generateRandomClientSessionId();

const dir = rtlDetect.isRtlLang(locale) ? 'rtl' : 'ltr';
const styledComponentsTheme = { dir };
const muiTheme = createMuiTheme({ direction: dir, ...MuiTheme });
// JSS and StylesProvider and <Helmet><body> are to make material-ui
// support right-to-left (e.g., Arabic).
// See https://material-ui.com/guides/right-to-left/
const jss = jssCreate({ plugins: [...jssPreset().plugins, rtl()] });

const callback = (translations) => {
  render(
    (
      <React.Fragment>
        <Helmet><body dir={dir} /></Helmet>
        <ClientSessionIdContext.Provider value={clientSessionId}>
          <PusherContext.Provider value={pusherContextValue}>
            <FlashMessageProvider>
              <ThemeProvider theme={styledComponentsTheme}>
                <StylesProvider jss={jss}>
                  <MuiThemeProvider theme={muiTheme}>
                    <Root store={store} translations={translations} locale={locale} />
                  </MuiThemeProvider>
                </StylesProvider>
              </ThemeProvider>
            </FlashMessageProvider>
          </PusherContext.Provider>
        </ClientSessionIdContext.Provider>
      </React.Fragment>
    ),
    document.getElementById('root'),
  );
};

if (locale === 'en') {
  callback({});
} else {
  Promise.all([
    import(/* webpackChunkName: "react-intl-[request]" */ `react-intl/locale-data/${locale}`),
    import(/* webpackChunkName: "messages-[request]" */ `../../../localization/translations/${locale}`),
  ]).then(([localeDataModule, messagesModule]) => {
    // https://medium.com/webpack/webpack-4-import-and-commonjs-d619d626b655
    const localeData = localeDataModule.default;
    const messages = messagesModule.default;
    addLocaleData(localeData);
    callback(messages);
  });
}
