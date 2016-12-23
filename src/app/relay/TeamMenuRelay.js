import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import TeamRoute from './TeamRoute';
import Can from '../components/Can';
import CheckContext from '../CheckContext';
import { teamSubdomain } from '../helpers';

class TeamMenu extends Component {
  render() {
    const { team } = this.props;
    const history = new CheckContext(this).getContextStore().history;

    return (
      <Can permissions={team.permissions} permission="update Team">
        <li className="header-actions__menu-item" onClick={history.push.bind(this, '/members')}>Manage team...</li>
      </Can>
    );
  }
}

TeamMenu.contextTypes = {
  store: React.PropTypes.object
};

const TeamMenuContainer = Relay.createContainer(TeamMenu, {
  fragments: {
    team: () => Relay.QL`
      fragment on Team {
        id,
        dbid,
        name,
        permissions,
      }
    `
  },
});

class TeamMenuRelay extends Component {
  render() {
    if (teamSubdomain()) {
      const route = new TeamRoute({ teamId: '' });
      return (<Relay.RootContainer Component={TeamMenuContainer} route={route} />);
    } else {
      return null;
    }
  }
}

export default TeamMenuRelay;
