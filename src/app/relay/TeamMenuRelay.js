import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import Relay from 'react-relay';
import MenuItem from 'material-ui/MenuItem';
import TeamRoute from './TeamRoute';
import Can from '../components/Can';
import CheckContext from '../CheckContext';

class TeamMenu extends Component {
  handleClick() {
    const overlay = document.querySelector('.header-actions__menu-overlay--active');
    if (overlay) {
      overlay.click(); // TODO: better way to clear overlay e.g. passing fn from HeaderActions
    }

    const history = new CheckContext(this).getContextStore().history;
    history.push(`/${this.props.team.slug}/members`);
  }

  render() {
    const { team } = this.props;

    return (
      <Can permissions={team.permissions} permission="update Team">
        <MenuItem
          key="teamMenuRelay.manageTeam"
          onClick={this.handleClick.bind(this)}
          primaryText={
            <FormattedMessage id="teamMenuRelay.manageTeam" defaultMessage="Manage team" />
          }
        />
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
        slug,
        permissions,
      }
    `,
  },
});

class TeamMenuRelay extends Component {
  render() {
    if (this.props.params.team) {
      const route = new TeamRoute({ teamSlug: this.props.params.team });
      return <Relay.RootContainer Component={TeamMenuContainer} route={route} />;
    }
    return null;
  }
}

export default TeamMenuRelay;
