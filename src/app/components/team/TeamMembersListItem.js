import React, { Component } from 'react';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import Relay from 'react-relay';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import { ListItem } from 'material-ui/List';
import styled from 'styled-components';
import Avatar from 'material-ui/Avatar';
import MdClear from 'react-icons/lib/md/clear';
import IconButton from 'material-ui/IconButton';
import UpdateTeamUserMutation from '../../relay/UpdateTeamUserMutation';
import {
  avatarStyle,
  selectStyle,
  checkBlue,
  listItemWithButtonsStyle,
  ellipsisStyle,
  black05,
} from '../../../../config-styles';

const StyledListItem = styled(ListItem)`
  border-top: 1px solid ${black05};
  & > div {
    ${ellipsisStyle};
  }
`;
const messages = defineMessages({
  contributor: {
    id: 'TeamMembersListItem.contributor',
    defaultMessage: 'Contributor',
  },
  journalist: {
    id: 'TeamMembersListItem.journalist',
    defaultMessage: 'Journalist',
  },
  editor: {
    id: 'TeamMembersListItem.editor',
    defaultMessage: 'Editor',
  },
  owner: {
    id: 'TeamMembersListItem.owner',
    defaultMessage: 'Owner',
  },
});

class TeamMembersListItem extends Component {
  handleDeleteTeamUser(e) {
    e.preventDefault();

    Relay.Store.commitUpdate(
      new UpdateTeamUserMutation({
        id: this.props.teamUser.node.id,
        status: 'banned',
      }),
    );
  }

  handleRoleChange(val) {
    Relay.Store.commitUpdate(
      new UpdateTeamUserMutation({
        id: this.props.teamUser.node.id,
        role: val,
      }),
    );
  }

  render() {
    const teamUser = this.props.teamUser;
    const isEditing = this.props.isEditing;

    const roles = [
      { value: 'contributor', label: this.props.intl.formatMessage(messages.contributor) },
      { value: 'journalist', label: this.props.intl.formatMessage(messages.journalist) },
      { value: 'editor', label: this.props.intl.formatMessage(messages.editor) },
      { value: 'owner', label: this.props.intl.formatMessage(messages.owner) },
    ];

    return (
      <StyledListItem
        disabled
        className="team-members__member"
        key={teamUser.node.id}
        primaryText={teamUser.node.user.name}
        style={listItemWithButtonsStyle}
        leftAvatar={
          <Avatar
            style={Object.assign(avatarStyle, { top: 'initial', order: 1 })}
            src={teamUser.node.user.profile_image}
            alt={teamUser.node.user.name}
          />
        }
      >
        <div style={{ order: '3', display: 'flex', alignItems: 'center' }}>
          <Select
            style={selectStyle}
            className="team-members__member-role"
            onChange={this.handleRoleChange.bind(this)}
            autosize
            searchable={false}
            backspaceRemoves={false}
            clearable={false}
            disabled={!isEditing || teamUser.node.status === 'banned'}
            options={roles}
            value={teamUser.node.role}
          />
          {isEditing && teamUser.node.status !== 'banned'
            ?
              <IconButton
                focusRippleColor={checkBlue}
                touchRippleColor={checkBlue}
                style={{ fontSize: '20px' }}
                onClick={this.handleDeleteTeamUser.bind(this)}
                tooltip={<FormattedMessage id="TeamMembersListItem.deleteMember" defaultMessage="Delete Member" />}
              >
                <MdClear />
              </IconButton>
            : null}
        </div>
      </StyledListItem>

    );
  }
}

TeamMembersListItem.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(TeamMembersListItem);
