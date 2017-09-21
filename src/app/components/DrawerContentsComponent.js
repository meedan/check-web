import React, { Component } from 'react';
import MenuItem from 'material-ui/MenuItem';
import { Link } from 'react-router';
import Divider from 'material-ui/Divider';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { stringHelper } from '../customHelpers';
import UserMenuItems from './UserMenuItems';
import {
  Text,
  HeaderTitle,
  subheading2,
  black87,
  white,
  units,
  caption,
  avatarSize,
  avatarStyle,
} from '../styles/js/shared';

class DrawerContents extends Component {

  render() {
    const team = this.props.team;
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

    // Team Avatar
    const TeamAvatar = styled.div`
      ${avatarStyle}
      background-image: url(${team.avatar});
      width: ${avatarSize};
      height: ${avatarSize};
    `;


    const Headline = styled(HeaderTitle)`
      font: ${subheading2};
      font-weight: 600;
      line-height: ${drawerTopOffset};
      color: ${black87};
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

    return (
      <div>
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
      </div>
    );
  }
}

export default DrawerContents;

