import React, { Component } from 'react';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import Favicon from 'react-favicon';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import rtlDetect from 'rtl-detect';
import merge from 'lodash.merge';
import config from 'config';
import styled, { injectGlobal } from 'styled-components';
import Header from './Header';
import LoginContainer from './LoginContainer';
import BrowserSupport from './BrowserSupport';
import CheckContext from '../CheckContext';
import DrawerNavigation from './DrawerNavigation';
import { bemClass } from '../helpers';
import Message from './Message';
import {
  muiThemeWithoutRtl,
  units,
  gutterMedium,
  black38,
  white,
  tiny,
  mediaQuery,
  borderRadiusDefault,
} from '../styles/js/shared';

import { layout, typography, localeAr, removeYellowAutocomplete } from '../styles/js/global';

// Global styles
injectGlobal`
  ${layout}
  ${typography}
  ${localeAr}
  ${removeYellowAutocomplete}
`;

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
`;

const StyledContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  padding-top: ${gutterMedium};
  padding-bottom: ${props => (props.inMediaPage ? '0' : gutterMedium)};
  width: 100%;
`;

// The "beta" label
//
const StyledDisclaimer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;

  & > span {
    ${mediaQuery.handheld`
      ${props => (props.isRtl ? 'left' : 'right')}: 2%;
    `}
    background-color: ${black38};
    border-radius: 0;
    color: ${white};
    font: ${tiny};
    letter-spacing: 1px;
    padding: 2px ${units(0.5)} 1px;
    position: absolute;
    text-transform: uppercase;
    z-index: 1;
    ${props => (props.isRtl ? 'left' : 'right')}: ${units(23)};
    border-bottom-right-radius: ${borderRadiusDefault};
    border-bottom-left-radius: ${borderRadiusDefault};
  }
`;

// Needed for onTouchTap
import injectTapEventPlugin from 'react-tap-event-plugin';

injectTapEventPlugin();

const messages = defineMessages({
  needRegister: {
    id: 'home.needRegister',
    defaultMessage:
      'First you need to register. Once registered, you can request to join the team.',
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
      open: false,
    };
  }

  getChildContext() {
    return {
      setMessage: (message) => {
        this.setState({ message });
      },
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

  getContext() {
    const context = new CheckContext(this).getContextStore();
    return context;
  }

  handleDrawerToggle = () => this.setState({ open: !this.state.open });

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

  resetMessage() {
    this.setState({ message: null });
  }

  render() {
    const { children } = this.props;
    const routeSlug = this.routeSlug(children);
    const muiThemeWithRtl = getMuiTheme(
      merge(muiThemeWithoutRtl, { isRtl: rtlDetect.isRtlLang(this.props.intl.locale) }),
    );

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
        return <LoginContainer loginCallback={this.loginCallback.bind(this)} message={message} />;
      }
      return null;
    }

    // @chris with @alex 2017-10-3
    //
    // TODO: Fix currentUserIsMember function.
    // context.currentUser.teams keys are actually the team names, not slugs

    const inTeamContext = !!this.props.params.team;
    const loggedIn = !!this.state.token;
    const inMediaPage = !!(this.props.params.team &&
      this.props.params.mediaId &&
      this.props.params.projectId);

    const currentUserIsMember = (() => {
      if (inTeamContext && loggedIn) {
        const user = this.getContext().currentUser;
        if (user.is_admin) {
          return true;
        }
        const teams = JSON.parse(user.teams);
        const team = teams[this.props.params.team] || {};
        return team.status === 'member';
      }
      return false;
    })();

    return (
      <MuiThemeProvider muiTheme={muiThemeWithRtl}>
        <span>
          <Favicon url={`/images/logo/${config.appName}.ico`} animated={false} />
          <BrowserSupport />
          <StyledWrapper className={bemClass('home', routeSlug, `--${routeSlug}`)}>
            <StyledDisclaimer isRtl={rtlDetect.isRtlLang(this.props.intl.locale)}>
              <span>
                <FormattedMessage id="home.beta" defaultMessage="Beta" />
              </span>
            </StyledDisclaimer>
            <Header
              drawerToggle={this.handleDrawerToggle.bind(this)}
              loggedIn={loggedIn}
              inTeamContext={inTeamContext}
              currentUserIsMember={currentUserIsMember}
              {...this.props}
            />
            <Message
              message={this.state.message}
              onClick={this.resetMessage.bind(this)}
              className="home__message"
              style={{
                position: 'absolute',
                width: '100%',
                zIndex: '1000',
              }}
            />
            <StyledContent inMediaPage={inMediaPage}>
              {children}
            </StyledContent>
          </StyledWrapper>
          <DrawerNavigation
            docked={false}
            open={this.state.open}
            drawerToggle={this.handleDrawerToggle.bind(this)}
            onRequestChange={open => this.setState({ open })}
            loggedIn={loggedIn}
            inTeamContext={inTeamContext}
            currentUserIsMember={currentUserIsMember}
            {...this.props}
          />
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

Home.childContextTypes = {
  setMessage: React.PropTypes.func,
};

export default injectIntl(Home);
