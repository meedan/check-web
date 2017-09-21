import React, { Component } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
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
  subheading2,
  avatarStyle,
  avatarSize,
  black87,
  white,
  units,
  caption,
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

const DrawerButtonGroup = styled(Row)`
  align-items: center;
  display: flex;
  height: 100%;
  overflow: hidden;
  width: 100%;
  cursor: pointer;

  &,
  &:visited {
    color: inherit;
  }
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
      <a
        style={styles.drawerFooterLink}
        target="_blank"
        rel="noopener noreferrer"
        href={stringHelper('TOS_URL')}
      >
        <FormattedMessage
          id="headerActions.tos"
          defaultMessage="Terms"
        />
      </a>
    );

    const privacyMenuItem = (
      <a
        style={styles.drawerFooterLink}
        target="_blank"
        rel="noopener noreferrer"
        href={stringHelper('PP_URL')}
      >
        <FormattedMessage
          id="headerActions.privacyPolicy"
          defaultMessage="Privacy"
        />
      </a>
    );

    const aboutMenuItem = (
      <a
        style={styles.drawerFooterLink}
        target="_blank"
        rel="noopener noreferrer"
        href={stringHelper('ABOUT_URL')}
      >
        <FormattedMessage
          id="headerActions.about"
          defaultMessage="About"
        />
      </a>
    );

    const contactMenuItem = (
      <a
        style={styles.drawerFooterLink}
        target="_blank"
        rel="noopener noreferrer"
        href={stringHelper('CONTACT_HUMAN_URL')}
      >
        <FormattedMessage
          id="headerActions.contactHuman"
          defaultMessage="Contact"
        />
      </a>
    );

    const projectList = this.props.team.projects.edges
      .sortp((a, b) => a.node.title.localeCompare(b.node.title))
      .map((p) => {
        const projectPath = `/${this.props.team.slug}/project/${p.node.dbid}`;

        return (
          <MenuItem key={p.node.dbid}>
            <Link to={projectPath}>
              <Text ellipsis>{p.node.title}</Text>
            </Link>
          </MenuItem>
        );
      });

    const { loggedIn } = this.props;

    const userAvatarOrSignIn = (() => {
      if (loggedIn) {
        return (
          <Offset>
            <Row>
              <UserAvatarRelay {...this.props} />
            </Row>
          </Offset>
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
        <DrawerButtonGroup
          title={team.name}
          className="header-actions__drawer-toggle"
          onClick={this.handleToggle}
        >
          {userAvatarOrSignIn}
          {isProjectUrl
            ? <TeamAvatar />
            : <Row>
              <TeamAvatar />
              <HeaderTitle offset>
                {team.name}
              </HeaderTitle>
            </Row>}
        </DrawerButtonGroup>
        <Drawer
          docked={false}
          open={this.state.open}
          onRequestChange={open => this.setState({ open })}
        >
          <MenuItem
            className="team-header__drawer-team-link"
            leftIcon={<TeamAvatar />}
          >
            <Link to={`/${this.props.team.slug}/`}>
              <Headline>{team.name}</Headline>
            </Link>
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
