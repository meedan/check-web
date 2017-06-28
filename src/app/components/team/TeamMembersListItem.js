import React, { Component } from 'react';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import Relay from 'react-relay';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import { ListItem } from 'material-ui/List';
import FlatButton from 'material-ui/FlatButton';
import Avatar from 'material-ui/Avatar';
import MdClear from 'react-icons/lib/md/clear';
import IconButton from 'material-ui/IconButton';
import UpdateTeamUserMutation from '../../relay/UpdateTeamUserMutation';
import {
  highlightBlue,
  checkBlue,
  avatarStyle,
  titleStyle,
  listItemStyle,
  listStyle,
  listItemButtonStyle,
} from '../../../../config-styles';

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
      <ListItem
        disableTouchRipple
        className="team-members__member"
        key={teamUser.node.id}
        primaryText={teamUser.node.user.name}
        leftAvatar={
          <Avatar
            style={avatarStyle}
            src={teamUser.node.user.profile_image}
            alt={teamUser.node.user.name}
          />
        }
      >
        <div style={Object.assign({ width: '20%', minWidth: '150' }, listItemButtonStyle)}>
          <Select
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
                onClick={this.handleDeleteTeamUser.bind(this)}
                tooltip={<FormattedMessage id="TeamMembersListItem.deleteMember" defaultMessage="Delete Member" />}
              >
                <MdClear />
              </IconButton>
            : null}
        </div>
      </ListItem>

    );
  }
}

TeamMembersListItem.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(TeamMembersListItem);
