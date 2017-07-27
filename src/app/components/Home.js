import React, { Component } from 'react';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import Favicon from 'react-favicon';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import rtlDetect from 'rtl-detect';
import merge from 'lodash.merge';
import config from 'config';
import Header from './Header';
import FooterRelay from '../relay/FooterRelay';
import LoginContainer from './LoginContainer';
import BrowserSupport from './BrowserSupport';
import CheckContext from '../CheckContext';
import { bemClass } from '../helpers';
import ContentColumn from './layout/ContentColumn';
import { muiThemeWithoutRtl } from '../styles/js/variables';

const messages = defineMessages({
  needRegister: {
    id: 'home.needRegister',
    defaultMessage: 'First you need to register. Once registered, you can request to join the team.',
  },
  somethingWrong: {
    id: 'home.somethingWrong',
    defaultMessage: 'Something went wrong – please refresh your browser or try again later.',
  },
});

class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      message: null,
      token: null,
      error: false,
      sessionStarted: false,
    };
  }

  componentWillMount() {
    this.setContext();
  }

  componentWillUpdate() {
    this.setContext();
  }

  setContext() {
    const context = new CheckContext(this);
    if (!this.state.token && !this.state.error) {
      context.startSession();
    }
    context.maybeRedirect(this.props.location.pathname, context.getContextStore().userData);
    context.setContext();
    context.startNetwork(this.state.token);
  }

  loginCallback() {
    this.setState({ error: false });
    this.forceUpdate();
  }

  routeSlug(children) {
    if (!(children && children.props.route)) {
      return null;
    }
    if (/\/media\/:mediaId/.test(children.props.route.path)) {
      return 'media'; // TODO: other pages as needed
    }
    if (/\/source\/:sourceId/.test(children.props.route.path)) {
      return 'source'; // TODO: other pages as needed
    }
    return null;
  }

  render() {
    const { children } = this.props;
    const routeSlug = this.routeSlug(children);
    const muiThemeWithRtl = getMuiTheme(merge(muiThemeWithoutRtl, { isRtl: rtlDetect.isRtlLang(this.props.intl.locale) }));

    if (!this.state.sessionStarted) {
      return null;
    }

    let message = null;
    if (this.state.error) {
      message = this.state.message;

      if (!message && /^[^/]+\/join$/.test(children.props.route.path)) {
        message = this.props.intl.formatMessage(messages.needRegister);
      }

      if (this.state.error && message && message.match(/\{ \[Error: Request has been terminated/)) {
        message = this.props.intl.formatMessage(messages.somethingWrong);
      }
    }

    const routeIsPublic = children && children.props.route.public;
    if (!routeIsPublic && !this.state.token) {
      if (this.state.error) {
        return (<LoginContainer loginCallback={this.loginCallback.bind(this)} message={message} />);
      }
      return null;
    }

    return (
      <MuiThemeProvider muiTheme={muiThemeWithRtl}>
        <span>
          <Favicon url={`/images/logo/${config.appName}.ico`} animated={false} />
          <BrowserSupport />
          <div className={bemClass('home', routeSlug, `--${routeSlug}`)}>
            <ContentColumn wide className="home__disclaimer"><span><FormattedMessage id="home.beta" defaultMessage="Beta" /></span></ContentColumn>
            <Header {...this.props} loggedIn={this.state.token} />
            <div className="home__content">{children}</div>
            <FooterRelay {...this.props} />
          </div>
        </span>
      </MuiThemeProvider>
    );
  }
}

Home.propTypes = {
  intl: intlShape.isRequired,
};

Home.contextTypes = {
  store: React.PropTypes.object,
};

export default injectIntl(Home);
