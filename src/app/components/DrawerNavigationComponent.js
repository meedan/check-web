import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import DrawerProjects from './drawer/Projects';
import TeamAvatar from './team/TeamAvatar';
import { stringHelper } from '../customHelpers';
import UserMenuItems from './UserMenuItems';
import UserUtil from './user/UserUtil';
import CheckContext from '../CheckContext';
import {
  Row,
  Offset,
  OffsetBothSides,
  HeaderTitle,
  white,
  black05,
  units,
  caption,
} from '../styles/js/shared';

// TODO Fix a11y issues
/* eslint jsx-a11y/click-events-have-key-events: 0 */
class DrawerNavigation extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showAddProj: false,
    };
  }

  getCurrentUser() {
    return new CheckContext(this).getContextStore().currentUser;
  }

  handleAddProj(e) {
    this.setState({ showAddProj: !this.state.showAddProj });
    e.stopPropagation();
  }

  render() {
    const { inTeamContext, loggedIn, drawerToggle } = this.props;

    // This component now renders based on teamPublicFragment
    // and decides whether to include <Project> which has its own team route/relay
    //
    // See DrawerNavigation
    //
    // — @chris with @alex 2017-10-3

    const { currentUserIsMember } = this.props;

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
        justifyContent: 'space-between',
        height: `calc(100vh - ${drawerHeaderHeight})`,
      },
    };

    const DrawerHeader = styled.div`
      height: ${drawerHeaderHeight};
      background-color: ${black05};
      padding: ${units(2)};
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
        href="https://medium.com/meedan-user-guides"
      >
        <MenuItem
          primaryText={
            <FormattedMessage id="headerActions.productGuides" defaultMessage="Product Guides" />
          }
        />
      </a>
    );

    const releaseNotesMenuItem = (
      <a
        key="drawer.releaseNotesMenuItem"
        style={styles.drawerFooterLink}
        target="_blank"
        rel="noopener noreferrer"
        href="https://docs.google.com/document/d/1xihUAGdHRgbCdLejqD9cjVMIEekYisObFGCdDcZGkZI"
      >
        <MenuItem
          primaryText={
            <FormattedMessage id="headerActions.releaseNotes" defaultMessage="Release Notes" />
          }
        />
      </a>
    );

    const checkLogo = <img width={units(8)} alt="Team Logo" src={stringHelper('LOGO_URL')} />;

    const userIsOwner =
      loggedIn &&
      inTeamContext &&
      UserUtil.myRole(this.getCurrentUser(), this.props.team.slug) === 'owner';

    return (
      <Drawer {...this.props}>
        <div onClick={drawerToggle}>

          {inTeamContext ?
            <DrawerHeader>
              <Link
                className="team-header__drawer-team-link"
                style={{ cursor: 'pointer' }}
                to={`/${this.props.team.slug}/`}
              >
                <Row>
                  <TeamAvatar
                    size={units(7)}
                    team={this.props.team}
                  />
                  <OffsetBothSides>
                    <HeaderTitle>
                      {this.props.team.name}
                    </HeaderTitle>
                  </OffsetBothSides>
                </Row>
              </Link>
            </DrawerHeader> :
            <DrawerHeader>
              <Row style={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Offset>
                  {loggedIn && checkLogo}
                </Offset>
              </Row>
            </DrawerHeader>}

          <div style={styles.drawerProjectsAndFooter}>
            <div style={styles.drawerProjects}>
              {inTeamContext && (currentUserIsMember || !this.props.team.private)
                ? <DrawerProjects
                  team={this.props.team.slug}
                  userIsOwner={userIsOwner}
                  showAddProj={this.state.showAddProj}
                  handleAddProj={this.handleAddProj.bind(this)}
                  toggleDrawerCallback={drawerToggle}
                />
                : null}
            </div>
            <div className="drawer__footer">
              {loggedIn ? <div><UserMenuItems hideContactMenuItem {...this.props} /></div> : null}

              {productGuidesMenuItem}

              {releaseNotesMenuItem}

              <div style={styles.drawerFooter}>
                {TosMenuItem}
                {privacyMenuItem}
                {aboutMenuItem}
                {contactMenuItem}
              </div>
            </div>
          </div>
        </div>
      </Drawer>
    );
  }
}

DrawerNavigation.contextTypes = {
  store: PropTypes.object,
};

export default DrawerNavigation;
