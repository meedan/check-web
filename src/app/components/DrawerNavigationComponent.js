import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import Button from '@material-ui/core/Button';
import Drawer from 'material-ui/Drawer';
import Divider from '@material-ui/core/Divider';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { FormattedMessage, injectIntl } from 'react-intl';
import styled from 'styled-components';
import IconSettings from '@material-ui/icons/Settings';
import Delete from '@material-ui/icons/Delete';
import rtlDetect from 'rtl-detect';
import DrawerProjects from './drawer/Projects';
import TeamAvatar from './team/TeamAvatar';
import { stringHelper } from '../customHelpers';
import UserMenuRelay from '../relay/containers/UserMenuRelay';
import CheckContext from '../CheckContext';
import {
  AlignOpposite,
  Row,
  Offset,
  OffsetBothSides,
  StyledHeading,
  white,
  body1,
  black05,
  units,
  caption,
  separationGray,
  SmallerStyledIconButton,
  Text,
} from '../styles/js/shared';

// TODO Fix a11y issues
/* eslint jsx-a11y/click-events-have-key-events: 0 */
class DrawerNavigationComponent extends Component {
  componentDidMount() {
    this.subscribe();
    this.setContextTeam();
  }

  componentWillUpdate(nextProps) {
    if (this.props.team && this.props.team.dbid !== nextProps.team.dbid) {
      this.unsubscribe();
    }
  }

  componentDidUpdate(prevProps) {
    this.setContextTeam();
    if (this.props.team && this.props.team.dbid !== prevProps.team.dbid) {
      this.subscribe();
    }
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  getContext() {
    return new CheckContext(this).getContextStore();
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
      team.id = team.team_graphql_id;
      context.setContextStore({ team });
    }
  }

  subscribe() {
    const { pusher } = this.getContext();
    if (pusher && this.props.team) {
      pusher.subscribe(this.props.team.pusher_channel).bind('media_updated', 'DrawerNavigationComponent', (data, run) => {
        if (this.getContext().clientSessionId !== data.actor_session_id) {
          if (run) {
            this.props.relay.forceFetch();
            return true;
          }
          return {
            id: `drawer-navigation-component-${this.props.team.dbid}`,
            callback: this.props.relay.forceFetch,
          };
        }
        return false;
      });
    }
  }

  unsubscribe() {
    const { pusher } = this.getContext();
    if (pusher && this.props.team) {
      pusher.unsubscribe(this.props.team.pusher_channel, 'media_updated', 'DrawerNavigationComponent');
    }
  }

  handleClickTeamSettings() {
    this.getHistory().push(`/${this.props.team.slug}/settings`);
  }

  render() {
    const { loggedIn } = this.props;
    const inTeamContext = this.props.team;

    // This component now renders based on teamPublicFragment
    // and decides whether to include <Project> which has its own team route/relay
    //
    // See DrawerNavigation
    //
    // — @chris with @alex 2017-10-3

    const { currentUserIsMember } = this.props;

    const drawerHeaderHeight = units(10);

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

    const isRtl = rtlDetect.isRtlLang(this.props.intl.locale);
    const fromDirection = isRtl ? 'right' : 'left';

    const saveCurrentPage = () => {
      if (window.location.pathname !== '/') {
        window.storage.set('previousPage', window.location.pathname);
      }
    };

    return (
      <Drawer
        {...this.props}
        containerStyle={{
          boxShadow: 'none',
          borderRight: 'solid 1px #e0e0e0',
          overflow: 'unset',
        }}
      >
        <div>

          {inTeamContext ?
            <DrawerHeader
              className="sc-itybZL dJsdpW"
              style={{
                padding: '10px',
                height: '68px',
                backgroundColor: 'white',
                borderBottom: `1px solid ${separationGray}`,
              }}
            >
              <Row>
                <Link
                  className="team-header__drawer-team-link"
                  style={{ cursor: 'pointer' }}
                  to={`/${this.props.team.slug}/`}
                >
                  <Row>
                    <TeamAvatar
                      size={units(5.5)}
                      team={this.props.team}
                    />
                    <OffsetBothSides
                      style={{
                        paddingRight: '0',
                      }}
                    >
                      <StyledHeading>
                        <Text maxWidth={units(20)} ellipsis>
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
                      style={{
                        padding: '12px 0 12px 0',
                        width: 'none',
                      }}
                      onClick={this.handleClickTeamSettings.bind(this)}
                      tooltip={
                        <FormattedMessage id="teamMenu.teamSettings" defaultMessage="Workspace settings" />
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
                ? <DrawerProjects fromDirection={fromDirection} team={this.props.team.slug} />
                : null}
            </div>
            { inTeamContext && currentUserIsMember ?
              <Link
                to={`/${this.props.team.slug}/trash`}
                className="project-list__link-trash"
              >
                <MenuItem className="project-list__item-trash">
                  <ListItemIcon>
                    <Delete />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Row style={{ font: body1 }}>
                        <FormattedMessage id="projects.trash" defaultMessage="Trash" />
                        <AlignOpposite fromDirection={fromDirection}>
                          {String(this.props.team.trash_count)}
                        </AlignOpposite>
                      </Row>
                    }
                  />
                </MenuItem>
              </Link>
              : null }
            <Divider />
            <div className="drawer__footer">
              {loggedIn ? <div><UserMenuRelay {...this.props} /></div> : (
                <Link to="/">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={saveCurrentPage}
                    style={{ width: '100%' }}
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
