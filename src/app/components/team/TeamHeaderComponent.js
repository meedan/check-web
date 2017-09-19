import React, { Component } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
import IconButton from 'material-ui/IconButton';
import { injectIntl, FormattedMessage } from 'react-intl';
import RaisedButton from 'material-ui/RaisedButton';
import UserAvatarRelay from '../../relay/UserAvatarRelay';
import UserMenuItems from '../UserMenuItems';
import CheckContext from '../../CheckContext';
import {
  Text,
  Row,
  Offset,
  HeaderTitle,
  defaultBorderRadius,
  subheading2,
  avatarStyle,
  headerHeight,
  avatarSize,
  black87,
  white,
  units,
  caption,
  highlightBlue,
} from '../../styles/js/shared';
import { stringHelper } from '../../customHelpers';

const drawerTopOffset = units(6.5);

const styles = {
  drawerFooter: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    backgroundColor: white,
    padding: `${units(2)}`,
  },
  drawerFooterLink: {
    font: caption,
  },
  drawerProjects: {
    overflow: 'auto',
    marginBottom: 'auto',
  },
  drawerProjectsAndFooter: {
    display: 'flex',
    flexDirection: 'column',
    height: `calc(100vh - ${drawerTopOffset})`,
  },
};

const TeamLink = styled(Link)`
  align-items: center;
  display: flex;
  height: 100%;
  overflow: hidden;
  width: 100%;
  cursor: pointer;

  &,
  &:hover {
    text-decoration: none;
  }

  &:active {
    background-color: ${highlightBlue};
  }

  &,
  &:visited {
    color: inherit;
  }
`;

const TeamNav = styled.nav`
  border-radius: ${defaultBorderRadius};
  display: flex;
  height: ${headerHeight};
  overflow: hidden;
`;

const Headline = styled(HeaderTitle)`
  font: ${subheading2};
  font-weight: 600;
  line-height: ${drawerTopOffset};
  color: ${black87};
`;

class TeamHeaderComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { open: false };
  }

  componentWillMount() {
    this.updateContext();
  }

  componentWillUpdate() {
    this.updateContext();
  }

  updateContext() {
    new CheckContext(this).setContextStore({ team: this.props.team });
  }

  handleToggle = () => this.setState({ open: !this.state.open });

  render() {
    const team = this.props.team;
    const isProjectUrl = /(.*\/project\/[0-9]+)/.test(window.location.pathname);

    const TeamAvatar = styled.div`
      ${avatarStyle}
      background-image: url(${team.avatar});
      width: ${avatarSize};
      height: ${avatarSize};
    `;

    const TosMenuItem = (
      <Link style={styles.drawerFooterLink} to={stringHelper('TOS_URL')}>
        <FormattedMessage
          id="headerActions.tos"
          defaultMessage="Terms"
        />
      </Link>
    );

    const privacyMenuItem = (
      <Link style={styles.drawerFooterLink} to={stringHelper('PP_URL')}>
        <FormattedMessage
          id="headerActions.privacyPolicy"
          defaultMessage="Privacy"
        />
      </Link>
    );

    const aboutMenuItem = (
      <Link style={styles.drawerFooterLink} to={stringHelper('ABOUT_URL')}>
        <FormattedMessage
          id="headerActions.about"
          defaultMessage="About"
        />
      </Link>
    );

    const contactMenuItem = (
      <Link
        style={styles.drawerFooterLink}
        to={stringHelper('CONTACT_HUMAN_URL')}
      >
        <FormattedMessage
          id="headerActions.contactHuman"
          defaultMessage="Contact"
        />
      </Link>
    );

    const projectList = this.props.team.projects.edges
      .sortp((a, b) => a.node.title.localeCompare(b.node.title))
      .map((p) => {
        const projectPath = `/${this.props.team.slug}/project/${p.node.dbid}`;

        return (
          <MenuItem key={p.node.dbid} href={projectPath}>
            <Text ellipsis>{p.node.title}</Text>
          </MenuItem>
        );
      });

    const { loggedIn } = this.props;

    const userAvatarButton = (() => {
      if (loggedIn) {
        return (
          <IconButton key="header.userAvatar" style={{ width: units(7), height: units(7) }}>
            <UserAvatarRelay {...this.props} />
          </IconButton>
        );
      }
      return (
        <Offset key="header.signIn">
          <Link to="/">
            <RaisedButton
              primary
              label={
                <FormattedMessage
                  defaultMessage="Sign In"
                  id="headerActions.signIn"
                />
              }
            />
          </Link>
        </Offset>
      );
    })();

    return (
      <div>
        <Row
          className="header-actions__menu-toggle"
          onClick={this.handleToggle}
          style={{ padding: 0 }}
        >
          <TeamNav>
            <TeamLink
              title={team.name}
              className="team-header__avatar"
            >
              {userAvatarButton}
              {isProjectUrl
                ? <TeamAvatar />
                : <Row>
                  <TeamAvatar />
                  <HeaderTitle offset>
                    {team.name}
                  </HeaderTitle>
                </Row>}
            </TeamLink>
          </TeamNav>
        </Row>
        <Drawer
          docked={false}
          open={this.state.open}
          onRequestChange={open => this.setState({ open })}
        >
          <MenuItem className="team-header__drawer-team-link" leftIcon={<TeamAvatar />} href={`/${this.props.team.slug}/`}>
            <Headline>{team.name}</Headline>
          </MenuItem>
          <Divider />
          <div style={styles.drawerProjectsAndFooter}>
            <div style={styles.drawerProjects}>
              {projectList}
            </div>

            <div>
              <UserMenuItems hideContactMenuItem {...this.props} />
            </div>

            <div style={styles.drawerFooter}>
              {TosMenuItem}
              {privacyMenuItem}
              {aboutMenuItem}
              {contactMenuItem}
            </div>
          </div>
        </Drawer>
      </div>
    );
  }
}

TeamHeaderComponent.contextTypes = {
  store: React.PropTypes.object,
};

export default injectIntl(TeamHeaderComponent);
