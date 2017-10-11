import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import Relay from 'react-relay';
import MenuItem from 'material-ui/MenuItem';
import Can from '../Can';
import CheckContext from '../../CheckContext';

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
      <Can permissions={team.permissions} permission="update Team" otherwise={
        <MenuItem
          key="teamMenu.viewTeam"
          onClick={this.handleClick.bind(this)}
          primaryText={
            <FormattedMessage id="teamMenu.viewTeam" defaultMessage="View team" />
          }
        />
      }>
        <span>
          <MenuItem
            key="teamMenu.manageTeam"
            onClick={this.handleClick.bind(this)}
            primaryText={
              <FormattedMessage id="teamMenu.manageTeam" defaultMessage="Manage team" />
            }
          />

          <MenuItem
            key="teamMenu.trash"
            onClick={this.handleClickTrash.bind(this)}
            primaryText={
              <FormattedMessage id="teamMenu.trash" defaultMessage="Trash" />
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

export default TeamMenu;
