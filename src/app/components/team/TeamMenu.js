import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import IconDelete from 'material-ui/svg-icons/action/delete';
import IconEdit from 'material-ui/svg-icons/image/edit';
import IconSettings from 'material-ui/svg-icons/action/settings';
import { can } from '../Can';
import CheckContext from '../../CheckContext';
import { SmallerStyledIconButton } from '../../styles/js/shared';

class TeamMenu extends Component {
  getHistory() {
    return new CheckContext(this).getContextStore().history;
  }

  handleClickEditTeam() {
    this.getHistory().push(`/${this.props.team.slug}/edit`);
  }

  handleClickTeamSettings() {
    this.getHistory().push(`/${this.props.team.slug}/settings`);
  }

  handleClickTrash() {
    this.getHistory().push(`/${this.props.team.slug}/trash`);
  }

  render() {
    const { team, currentUserIsMember, pageType } = this.props;

    return (
      <div>
        { pageType === 'team' && can(team.permissions, 'update Team') ?
          <SmallerStyledIconButton
            className="team-menu__edit-team-button"
            onClick={this.handleClickEditTeam.bind(this)}
            tooltip={
              <FormattedMessage id="teamMenu.editTeam" defaultMessage="Edit team" />
            }
          >
            <IconEdit />
          </SmallerStyledIconButton> : null
        }
        { pageType === 'team' && currentUserIsMember ?
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
        { currentUserIsMember ?
          <SmallerStyledIconButton
            onClick={this.handleClickTrash.bind(this)}
            tooltip={
              <FormattedMessage id="teamMenu.trash" defaultMessage="View trash" />
            }
          >
            <IconDelete />
          </SmallerStyledIconButton> : null
        }
      </div>
    );
  }
}

TeamMenu.contextTypes = {
  store: PropTypes.object,
};

export default TeamMenu;
