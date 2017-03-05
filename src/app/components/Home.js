import React, { Component, PropTypes } from 'react';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import Relay from 'react-relay';
import util from 'util';
import Header from './Header';
import FooterRelay from '../relay/FooterRelay';
import LoginMenu from './LoginMenu';
import { blue500, blue600, blue700, blue800 } from 'material-ui/styles/colors';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { Link } from 'react-router';
import config from 'config';
import BrowserSupport from './BrowserSupport';
import CheckContext from '../CheckContext';

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

const muiTheme = getMuiTheme({
  palette: {
    primary1Color: '#2e77fc',
    primary2Color: '#2e77fc',
    primary3Color: '#2e77fc',
    accent1Color: blue600,
    accent2Color: blue700,
    accent3Color: blue800,
  },
});

class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      message: null,
      token: null,
      error: false,
    };
  }

  loginCallback() {
    this.setState({ error: false });
    this.forceUpdate();
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

  render() {
    const { state, children } = this.props;

    const routeIsPublic = children && children.props.route.public;
    if (!routeIsPublic && !this.state.token) {
      if (this.state.error) {
        let message = this.state.message;

        if (!message && /^[^\/]+\/join$/.test(children.props.route.path)) {
          message = this.props.intl.formatMessage(messages.needRegister);
        }

        if (this.state.error && message && message.match(/\{ \[Error\: Request has been terminated/)) {
          message = this.props.intl.formatMessage(messages.somethingWrong);
        }

        return (<LoginMenu loginCallback={this.loginCallback.bind(this)} message={message} />);
      }
      return null;
    }

    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <span>
          <BrowserSupport />
          <div className="home">
            <span className="home__disclaimer"><FormattedMessage id="home.beta" defaultMessage="Beta" /></span>
            { this.state.token ? <Header {...this.props} /> : null }
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
