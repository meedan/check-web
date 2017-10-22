import React, { Component } from 'react';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import Relay from 'react-relay';
import { Link } from 'react-router';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import { ListItem } from 'material-ui/List';
import SourcePicture from '../source//SourcePicture';
import MdClear from 'react-icons/lib/md/clear';
import IconButton from 'material-ui/IconButton';
import RaisedButton from 'material-ui/RaisedButton';
import rtlDetect from 'rtl-detect';
import UpdateTeamUserMutation from '../../relay/UpdateTeamUserMutation';
import Tooltip from 'rc-tooltip';
import 'rc-tooltip/assets/bootstrap_white.css';
import UserTooltip from '../user/UserTooltip';
import {
  selectStyle,
  checkBlue,
  FlexRow,
  Text,
  buttonInButtonGroupStyle,
  units,
  Offset,
} from '../../styles/js/shared';

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

  handleTeamMembershipRequest(status) {
    Relay.Store.commitUpdate(
      new UpdateTeamUserMutation({
        id: this.props.teamUser.node.id,
        status,
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
        className="team-members__member"
        key={teamUser.node.id}
        disabled
      >
        <FlexRow>
          <FlexRow>
            <Link to={`/check/user/${teamUser.node.user.dbid}`} className="team-members__profile-link">
              <FlexRow>
                <Tooltip placement="top" overlay={<UserTooltip user={teamUser.node.user} />}>
                  <Offset isRtl={rtlDetect.isRtlLang(this.props.intl.locale)}>
                    <SourcePicture
                      className="avatar"
                      object={teamUser.node.user.source}
                      alt={teamUser.node.user.name}
                    />
                  </Offset>
                </Tooltip>
                <Text ellipsis>
                  {teamUser.node.user.name}
                </Text>
              </FlexRow>
            </Link>
          </FlexRow>

          {(() => {
            if (this.props.requestingMembership) {
              return (
                <FlexRow>
                  <RaisedButton
                    style={buttonInButtonGroupStyle}
                    onClick={this.handleTeamMembershipRequest.bind(this, 'member')}
                    className="team-member-requests__user-button--approve"
                    label={
                      <FormattedMessage
                        id="TeamMembershipRequestsListItem.approve"
                        defaultMessage="Approve"
                      />
                    }
                  />
                  <RaisedButton
                    onClick={this.handleTeamMembershipRequest.bind(this, 'banned')}
                    className="team-member-requests__user-button--deny"
                    label={
                      <FormattedMessage id="TeamMembershipRequestsListItem.deny" defaultMessage="Ignore" />
                    }
                  />
                </FlexRow>
              );
            }
            return (
              <FlexRow>
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
              </FlexRow>
            );
          })()}

        </FlexRow>
      </ListItem>

    );
  }
}

TeamMembersListItem.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(TeamMembersListItem);
