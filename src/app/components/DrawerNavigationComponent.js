import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { browserHistory, Link } from 'react-router';
import Button from '@material-ui/core/Button';
import Drawer from '@material-ui/core/Drawer';
import Divider from '@material-ui/core/Divider';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { withStyles } from '@material-ui/core/styles';
import { FormattedMessage } from 'react-intl';
import DeleteIcon from '@material-ui/icons/Delete';
import { withPusher, pusherShape } from '../pusher';
import DrawerProjects from './drawer/Projects';
import DrawerHeader from './drawer/DrawerHeader';
import UserMenuRelay from '../relay/containers/UserMenuRelay';
import CheckContext from '../CheckContext';
import {
  AlignOpposite,
  Row,
  body1,
  units,
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

  setContextTeam() {
    const context = new CheckContext(this);
    const { team } = this.props;
    if (team) {
      team.id = team.team_graphql_id;
      context.setContextStore({ team });
    }
  }

  subscribe() {
    const { pusher, clientSessionId, team } = this.props;
    if (pusher && team) {
      pusher.subscribe(team.pusher_channel).bind('media_updated', 'DrawerNavigationComponent', (data, run) => {
        if (clientSessionId !== data.actor_session_id) {
          if (run) {
            this.props.relay.forceFetch();
            return true;
          }
          return {
            id: `drawer-navigation-component-${team.dbid}`,
            callback: this.props.relay.forceFetch,
          };
        }
        return false;
      });
    }
  }

  unsubscribe() {
    const { pusher, team } = this.props;
    if (pusher && team) {
      pusher.unsubscribe(team.pusher_channel, 'media_updated', 'DrawerNavigationComponent');
    }
  }

  handleClickTeamSettings() {
    browserHistory.push(`/${this.props.team.slug}/settings`);
  }

  render() {
    const {
      team, currentUserIsMember, loggedIn, classes,
    } = this.props;

    // This component now renders based on teamPublicFragment
    // and decides whether to include <Project> which has its own team route/relay
    //
    // See DrawerNavigation
    //
    // — @chris with @alex 2017-10-3

    const saveCurrentPage = () => {
      if (window.location.pathname !== '/') {
        window.storage.set('previousPage', window.location.pathname);
      }
    };

    return (
      <Drawer open variant="persistent" anchor="left" classes={classes}>
        <DrawerHeader team={team} loggedIn={loggedIn} currentUserIsMember={currentUserIsMember} />
        <Divider />
        {!!team && (currentUserIsMember || !this.props.team.private) ? (
          <DrawerProjects team={team.slug} />
        ) : null}
        {!!team && currentUserIsMember ? (
          <Link to={`/${team.slug}/trash`} className="project-list__link-trash">
            <MenuItem className="project-list__item-trash">
              <ListItemIcon>
                <DeleteIcon />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Row style={{ font: body1 }}>
                    <FormattedMessage id="projects.trash" defaultMessage="Trash" />
                    <AlignOpposite>
                      {String(this.props.team.trash_count)}
                    </AlignOpposite>
                  </Row>
                }
              />
            </MenuItem>
          </Link>
        ) : null}
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
      </Drawer>
    );
  }
}

DrawerNavigationComponent.propTypes = {
  pusher: pusherShape.isRequired,
  clientSessionId: PropTypes.string.isRequired,
  classes: PropTypes.object.isRequired,
};

DrawerNavigationComponent.contextTypes = {
  store: PropTypes.object,
};

const drawerStyles = {
  paper: {
    width: units(32),
    minWidth: units(32),
    maxWidth: units(32),
    overflow: 'hidden',
  },
  root: {
    width: units(32),
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
  },
};

export default withStyles(drawerStyles)(withPusher(DrawerNavigationComponent));
