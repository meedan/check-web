import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import IconDelete from 'material-ui/svg-icons/action/delete';
import IconEdit from 'material-ui/svg-icons/image/edit';
import IconSettings from 'material-ui/svg-icons/action/settings';
import ViewListIcon from '@material-ui/icons/ViewList';
import ViewComfyIcon from '@material-ui/icons/ViewComfy';
import { can } from '../Can';
import CheckContext from '../../CheckContext';
import { SmallerStyledIconButton } from '../../styles/js/shared';
import { searchQueryFromUrl, urlFromSearchQuery } from '../../components/search/Search';

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

  handleClickView() {
    const searchQuery = searchQueryFromUrl();
    const targetView = window.storage.getValue('view-mode') === 'dense' ?
      'list' : 'dense';
    const prefix = window.location.pathname.match(/.*\/search/)[0];

    this.getHistory().push(urlFromSearchQuery(searchQuery, `${prefix}/${targetView}`));
  }

  render() {
    const { team, currentUserIsMember, pageType } = this.props;

    let toggleViewButton = null;
    if (/\/search/.test(window.location.pathname)) {
      const viewIcon = window.storage.getValue('view-mode') === 'dense' ?
        <ViewListIcon /> : <ViewComfyIcon />;

      const viewTooltip = window.storage.getValue('view-mode') === 'dense'
        ? <FormattedMessage id="teamMenu.listView" defaultMessage="List view" />
        : <FormattedMessage id="teamMenu.denseView" defaultMessage="Compact view" />;

      toggleViewButton = (
        <SmallerStyledIconButton
          onClick={this.handleClickView.bind(this)}
          tooltip={viewTooltip}
        >
          {viewIcon}
        </SmallerStyledIconButton>
      );
    }

    return (
      <div>
        {toggleViewButton}
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
