import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import TeamRoute from './TeamRoute';
import Can from '../components/Can';
import CheckContext from '../CheckContext';
import { teamSubdomain } from '../helpers';

class TeamMenu extends Component {
  handleClick () {
    const overlay = document.querySelector('.header-actions__menu-overlay--active')
    if (overlay) {
      overlay.click(); // TODO: better way to clear overlay e.g. passing fn from HeaderActions
    }

    const history = new CheckContext(this).getContextStore().history;
    history.push('/members');
  }

  render() {
    const { team } = this.props;

    return (
      <Can permissions={team.permissions} permission="update Team">
        <li className="header-actions__menu-item" onClick={this.handleClick.bind(this)}>Manage team</li>
      </Can>
    );
  }
}

TeamMenu.contextTypes = {
  store: React.PropTypes.object,
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
    `,
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
