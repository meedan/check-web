import React, { Component } from 'react';
import { Link } from 'react-router';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import { FormattedMessage } from 'react-intl';
import IconButton from 'material-ui/IconButton';
import styled from 'styled-components';
import Projects from './drawer/Projects';
import { stringHelper } from '../customHelpers';
import UserMenuItems from './UserMenuItems';
import UserAvatarRelay from '../relay/UserAvatarRelay';
import CheckContext from '../CheckContext';
import {
  Row,
  Offset,
  HeaderTitle,
  white,
  black05,
  black54,
  units,
  caption,
  avatarSize,
  avatarStyle,
  body2,
} from '../styles/js/shared';

class DrawerNavigation extends Component {
  getHistory() {
    return new CheckContext(this).getContextStore().history;
  }

  handleAvatarClick = () => {
    this.getHistory().push('/check/me');
    this.props.drawerToggle();
  }

  render() {
    const { inTeamContext, loggedIn, drawerToggle } = this.props;

    // This component now renders based on teamPublicFragment
    // and decides whether to include <Project> which has its own team route/relay
    //
    // See DrawerNavigation
    //
    // — @chris with @alex 2017-10-3

    const currentUserIsMember = this.props.currentUserIsMember;

    const drawerHeaderHeight = units(14);

    const styles = {
      drawerFooter: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        backgroundColor: white,
        padding: `${units(2)}`,
        flexWrap: 'wrap',
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
        height: `calc(100vh - ${drawerHeaderHeight})`,
      },
      drawerYourProfileButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: units(4),
        height: units(4),
        padding: 0,
        margin: `0 ${units(1)}`,
      },
    };

    const DrawerHeader = styled.div`
      height: ${drawerHeaderHeight};
      background-color: ${black05};
      padding: ${units(2)};
    `;

    // Team Avatar
    const TeamAvatar = styled.div`
      ${avatarStyle}
      width: ${props => (props.size ? props.size : avatarSize)};
      height: ${props => (props.size ? props.size : avatarSize)};
    `;

    const Headline = styled(HeaderTitle)`
      font: ${body2};
      font-weight: 700;
      padding-top: ${units(1)};
      color: ${black54};
    `;

    const TosMenuItem = (
      <a
        style={styles.drawerFooterLink}
        target="_blank"
        rel="noopener noreferrer"
        href={stringHelper('TOS_URL')}
      >
        <FormattedMessage id="headerActions.tos" defaultMessage="Terms" />
      </a>
    );

    const privacyMenuItem = (
      <a
        style={styles.drawerFooterLink}
        target="_blank"
        rel="noopener noreferrer"
        href={stringHelper('PP_URL')}
      >
        <FormattedMessage id="headerActions.privacyPolicy" defaultMessage="Privacy" />
      </a>
    );

    const aboutMenuItem = (
      <a
        style={styles.drawerFooterLink}
        target="_blank"
        rel="noopener noreferrer"
        href={stringHelper('ABOUT_URL')}
      >
        <FormattedMessage id="headerActions.about" defaultMessage="About" />
      </a>
    );

    const contactMenuItem = (
      <a
        style={styles.drawerFooterLink}
        target="_blank"
        rel="noopener noreferrer"
        href={stringHelper('CONTACT_HUMAN_URL')}
      >
        <FormattedMessage id="headerActions.contactHuman" defaultMessage="Contact" />
      </a>
    );

    const productGuidesMenuItem = (
      <a
        key="drawer.productGuidesMenuItem"
        style={styles.drawerFooterLink}
        target="_blank"
        rel="noopener noreferrer"
        href="http://medium.com/meedan-product-guides"
      >
        <MenuItem
          primaryText={
            <FormattedMessage id="headerActions.productGuides" defaultMessage="Product Guides" />
          }
        />
      </a>
    );

    const yourProfileButton = (
      <IconButton
        style={styles.drawerYourProfileButton}
        tooltip={
          <FormattedMessage id="drawerNavigation.userProfile" defaultMessage="Your Profile" />
        }
        tooltipPosition="bottom-center"
        onTouchTap={this.handleAvatarClick}
      >
        <UserAvatarRelay size={units(4)} {...this.props} />
      </IconButton>
    );

    const checkLogo = <img width={units(8)} alt="Team Logo" src={stringHelper('LOGO_URL')} />;

    return (
      <Drawer {...this.props}>
        <div onClick={drawerToggle}>

          {inTeamContext
            ? <DrawerHeader>
              <Row style={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Link style={{ cursor: 'pointer' }} to={`/${this.props.team.slug}/`}>
                  <TeamAvatar
                    style={{ backgroundImage: `url(${this.props.team.avatar})` }}
                    size={units(7)}
                  />
                </Link>
                <Offset>
                  {loggedIn && yourProfileButton}
                </Offset>
              </Row>

              <Link className="team-header__drawer-team-link" to={`/${this.props.team.slug}/`}>
                <Headline>{this.props.team.name}</Headline>
              </Link>
            </DrawerHeader>
            : <DrawerHeader>
              <Row style={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Offset>
                  {loggedIn ? yourProfileButton : checkLogo}
                </Offset>
              </Row>
            </DrawerHeader>}

          <div style={styles.drawerProjectsAndFooter}>
            <div style={styles.drawerProjects}>
              {inTeamContext && (currentUserIsMember || !this.props.team.private)
                ? <Projects team={this.props.team.slug} />
                : null}
            </div>

            {loggedIn ? <div><UserMenuItems hideContactMenuItem {...this.props} /></div> : null}

            {productGuidesMenuItem}

            <div style={styles.drawerFooter}>
              {TosMenuItem}
              {privacyMenuItem}
              {aboutMenuItem}
              {contactMenuItem}
            </div>
          </div>
        </div>
      </Drawer>
    );
  }
}

DrawerNavigation.contextTypes = {
  store: React.PropTypes.object,
};

export default DrawerNavigation;
