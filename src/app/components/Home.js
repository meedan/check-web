import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import util from 'util';
import Header from './Header';
import FooterRelay from '../relay/FooterRelay';
import LoginMenu from './LoginMenu';
import Message from './Message';
import { blue500, blue600, blue700, blue800 } from 'material-ui/styles/colors';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { Link } from 'react-router';
import FontAwesome from 'react-fontawesome';
import config from 'config';
import BrowserSupport from './BrowserSupport';
import CheckContext from '../CheckContext';

const muiTheme = getMuiTheme({
  palette: {
    primary1Color: blue500,
    primary2Color: blue500,
    primary3Color: blue500,
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
          message = 'First you need to register. Once registered, you can request to join the team.';
        }

        if (this.state.error && message && message.match(/\{ \[Error\: Request has been terminated/)) {
          message = 'Something went wrong – please refresh your browser or try again later.';
        }

        return (<LoginMenu loginCallback={this.loginCallback.bind(this)} message={message} />);
      }
      return null;
    }

    const routeIsFullscreen = children && children.props.route.fullscreen;
    if (routeIsFullscreen) {
      return (<div className="home home--fullscreen">{children}</div>);
    }

    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <span>
          <BrowserSupport />
          <div className="home">
            <span className="home__disclaimer">Beta</span>
            { this.state.token ? <Header {...this.props} /> : null }
            <main className="home__main">
              <div className="home__global-message global-message"><Message message={this.state.message} /></div>
              <div className="home__content">{children}</div>
            </main>
            <FooterRelay {...this.props} />
          </div>
        </span>
      </MuiThemeProvider>
    );
  }
}

Home.contextTypes = {
  store: React.PropTypes.object,
};

export default Home;
