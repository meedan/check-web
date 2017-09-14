import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import Relay from 'react-relay';
import MenuItem from 'material-ui/MenuItem';
import TeamRoute from './TeamRoute';
import Can from '../components/Can';
import CheckContext from '../CheckContext';

class TeamMenu extends Component {
  getHistory() {
    const history = new CheckContext(this).getContextStore().history;
    return history;
  }

  handleClick() {
    const history = this.getHistory();
    history.push(`/${this.props.team.slug}/members`);
  }

  handleClickTrash() {
    const history = this.getHistory();
    history.push(`/${this.props.team.slug}/trash`);
  }

  render() {
    const { team } = this.props;

    return (
      <Can permissions={team.permissions} permission="update Team">
        <span>
          <MenuItem
            key="teamMenuRelay.manageTeam"
            onClick={this.handleClick.bind(this)}
            primaryText={
              <FormattedMessage id="teamMenuRelay.manageTeam" defaultMessage="Manage team" />
            }
          />

          <MenuItem
            key="teamMenuRelay.trash"
            onClick={this.handleClickTrash.bind(this)}
            primaryText={
              <FormattedMessage id="teamMenuRelay.trash" defaultMessage="Trash" />
            }
          />
        </span>
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
