import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import IconDelete from 'material-ui/svg-icons/action/delete';
import IconEdit from 'material-ui/svg-icons/image/edit';
import CheckContext from '../../CheckContext';
import { SmallerStyledIconButton } from '../../styles/js/shared';

class TeamMenu extends Component {
  getHistory() {
    return new CheckContext(this).getContextStore().history;
  }

  handleClickEditTeam() {
    this.getHistory().push(`/${this.props.team.slug}/edit`);
  }

  handleClickEditSource() {
    const { team, projectId, sourceId } = this.props.params;

    this.getHistory().push(`/${team}/project/${projectId}/source/${sourceId}/edit`);
  }

  handleClickTrash() {
    this.getHistory().push(`/${this.props.team.slug}/trash`);
  }

  render() {
    const { currentUserIsMember, pageType, loggedIn } = this.props;

    return (
      <div>
        { pageType === 'team' && loggedIn ?
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
        { pageType === 'source' && loggedIn ?
          <SmallerStyledIconButton
            className="team-menu__edit-source-button"
            onClick={this.handleClickEditSource.bind(this)}
            tooltip={
              <FormattedMessage id="teamMenu.editSource" defaultMessage="Edit source" />
            }
          >
            <IconEdit />
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
