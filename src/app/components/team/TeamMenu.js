import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import IconDelete from 'material-ui/svg-icons/action/delete';
import CheckContext from '../../CheckContext';
import { SmallerStyledIconButton } from '../../styles/js/shared';

class TeamMenu extends Component {
  getHistory() {
    return new CheckContext(this).getContextStore().history;
  }

  handleClickTrash() {
    this.getHistory().push(`/${this.props.team.slug}/trash`);
  }

  render() {
    const { currentUserIsMember } = this.props;

    return (
      currentUserIsMember ?
        <SmallerStyledIconButton
          key="teamMenu.trash"
          onClick={this.handleClickTrash.bind(this)}
          tooltip={
            <FormattedMessage id="teamMenu.trash" defaultMessage="Trash" />
          }
        >
          <IconDelete />
        </SmallerStyledIconButton> : null
    );
  }
}

TeamMenu.contextTypes = {
  store: PropTypes.object,
};

export default TeamMenu;
