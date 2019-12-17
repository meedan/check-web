import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import Button from '@material-ui/core/Button';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import { FormattedMessage, injectIntl } from 'react-intl';
import styled from 'styled-components';
import IconSettings from 'material-ui/svg-icons/action/settings';
import Delete from '@material-ui/icons/Delete';
import rtlDetect from 'rtl-detect';
import DrawerProjects from './drawer/Projects';
import TeamAvatar from './team/TeamAvatar';
import { stringHelper } from '../customHelpers';
import UserUtil from './user/UserUtil';
import UserMenuRelay from '../relay/containers/UserMenuRelay';
import CheckContext from '../CheckContext';
import {
  AlignOpposite,
  Row,
  Offset,
  OffsetBothSides,
  StyledHeading,
  white,
  black05,
  units,
  caption,
  SmallerStyledIconButton,
  Text,
} from '../styles/js/shared';

// TODO Fix a11y issues
/* eslint jsx-a11y/click-events-have-key-events: 0 */
class DrawerNavigationComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showAddProj: false,
    };
  }

  componentDidMount() {
    this.setContextTeam();
  }

  componentDidUpdate() {
    this.setContextTeam();
  }

  getCurrentUser() {
    return new CheckContext(this).getContextStore().currentUser;
  }

  getHistory() {
    return new CheckContext(this).getContextStore().history;
  }

  setContextTeam() {
    const context = new CheckContext(this);
    const { team } = this.props;
    if (team) {
      context.setContextStore({ team });
    }
  }

  handleClickTeamSettings() {
    this.getHistory().push(`/${this.props.team.slug}/settings`);
  }

  handleAddProj(e) {
    this.setState({ showAddProj: !this.state.showAddProj });
    e.stopPropagation();
  }

  render() {
    const { loggedIn, drawerToggle } = this.props;
    const inTeamContext = this.props.inTeamContext && this.props.team;

    // This component now renders based on teamPublicFragment
    // and decides whether to include <Project> which has its own team route/relay
    //
    // See DrawerNavigation
    //
    // — @chris with @alex 2017-10-3

    const { currentUserIsMember } = this.props;

    const drawerHeaderHeight = units(11);

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

    const checkLogo = <img width={units(8)} alt="Team Logo" src={stringHelper('LOGO_URL')} />;

    const userIsOwner =
      loggedIn &&
      inTeamContext &&
      UserUtil.myRole(this.getCurrentUser(), this.props.team.slug) === 'owner';

    const isRtl = rtlDetect.isRtlLang(this.props.intl.locale);
    const fromDirection = isRtl ? 'right' : 'left';

    const saveCurrentPage = () => {
      if (window.location.pathname !== '/') {
        window.storage.set('previousPage', window.location.pathname);
      }
    };

    return (
      <Drawer {...this.props}>
        <div onClick={drawerToggle}>

          {inTeamContext ?
            <DrawerHeader>
              <Row>
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
                      <StyledHeading>
                        <Text maxWidth={units(12)} ellipsis>
                          {this.props.team.name}
                        </Text>
                      </StyledHeading>
                    </OffsetBothSides>
                  </Row>
                </Link>
                <AlignOpposite fromDirection={fromDirection}>
                  { currentUserIsMember ?
                    <SmallerStyledIconButton
                      className="team-menu__team-settings-button"
                      onClick={this.handleClickTeamSettings.bind(this)}
                      tooltip={
                        <FormattedMessage id="teamMenu.teamSettings" defaultMessage="Team settings" />
                      }
                    >
                      <IconSettings />
                    </SmallerStyledIconButton> : null
                  }
                </AlignOpposite>
              </Row>
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
            { inTeamContext && currentUserIsMember ?
              <Link to={`/${this.props.team.slug}/trash`} className="project-list__link-trash">
                <MenuItem
                  className="project-list__item-trash"
                  primaryText={<FormattedMessage id="projects.trash" defaultMessage="Trash" />}
                  leftIcon={<Delete />}
                />
              </Link>
              : null }
            <div className="drawer__footer">

              {loggedIn ? <div><UserMenuRelay {...this.props} /></div> : (
                <Link to="/">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={saveCurrentPage}
                  >
                    <FormattedMessage defaultMessage="Sign In" id="headerActions.signIn" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </Drawer>
    );
  }
}

DrawerNavigationComponent.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(DrawerNavigationComponent);
