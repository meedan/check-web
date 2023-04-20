/* eslint-disable @calm/react-intl/missing-attribute */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { withStyles } from '@material-ui/core/styles';
import { withPusher, pusherShape } from '../../pusher';
import TeamAvatar from '../team/TeamAvatar';
import UserMenuRelay from '../../relay/containers/UserMenuRelay';
import CheckContext from '../../CheckContext';
import {
  units,
} from '../../styles/js/shared';
import styles from './DrawerRail.module.css';

// TODO Fix a11y issues
/* eslint jsx-a11y/click-events-have-key-events: 0 */
class DrawerRail extends Component {
  componentDidMount() {
    this.subscribe();
    this.setContextTeam();
  }

  componentWillUpdate(nextProps) {
    if (this.props.team && this.props.team?.dbid !== nextProps.team?.dbid) {
      this.unsubscribe();
    }
  }

  componentDidUpdate(prevProps) {
    this.setContextTeam();
    if (this.props.team && this.props.team?.dbid !== prevProps.team?.dbid) {
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
      pusher.subscribe(team.pusher_channel).bind('media_updated', 'DrawerRail', (data, run) => {
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
      pusher.unsubscribe(team.pusher_channel, 'media_updated', 'DrawerRail');
    }
  }

  handleClickTeamSettings() {
    browserHistory.push(`/${this.props.team.slug}/settings`);
  }

  render() {
    const {
      drawerOpen,
      onDrawerOpenChange,
      loggedIn,
    } = this.props;

    return (
      <div className={styles.drawerRail}>
        <TeamAvatar className={styles.teamLogo} size={units(5.5)} team={this.props.team} />
        <button onClick={() => onDrawerOpenChange(!drawerOpen)}>{drawerOpen ? 'oo' : 'cc'}</button>
        {loggedIn ? <div><UserMenuRelay {...this.props} /></div> : null}
      </div>
    );
  }
}

DrawerRail.propTypes = {
  pusher: pusherShape.isRequired,
  clientSessionId: PropTypes.string.isRequired,
  classes: PropTypes.object.isRequired,
};

DrawerRail.contextTypes = {
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
    minWidth: units(32),
    maxWidth: units(32),
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
  },
};

export default withStyles(drawerStyles)(withPusher(DrawerRail));
