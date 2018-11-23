import React, { Component } from 'react';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import Relay from 'react-relay/classic';
import { Link } from 'react-router';
import { ListItem } from 'material-ui/List';
import MdClear from 'react-icons/lib/md/clear';
import IconButton from 'material-ui/IconButton';
import RaisedButton from 'material-ui/RaisedButton';
import rtlDetect from 'rtl-detect';
import Tooltip from 'rc-tooltip';
import RoleSelect from './RoleSelect';
import '../../styles/css/tooltip.css';
import SourcePicture from '../source/SourcePicture';
import UpdateTeamUserMutation from '../../relay/mutations/UpdateTeamUserMutation';
import UserTooltip from '../user/UserTooltip';
import {
  checkBlue,
  FlexRow,
  Text,
  buttonInButtonGroupStyle,
  Offset,
} from '../../styles/js/shared';

class TeamMembersListItem extends Component {
  handleDeleteTeamUser(e) {
    e.preventDefault();

    Relay.Store.commitUpdate(new UpdateTeamUserMutation({
      id: this.props.teamUser.node.id,
      status: 'banned',
    }));
  }

  handleRoleChange(e) {
    Relay.Store.commitUpdate(new UpdateTeamUserMutation({
      id: this.props.teamUser.node.id,
      role: e.target.value,
    }));
  }

  handleTeamMembershipRequest(status) {
    Relay.Store.commitUpdate(new UpdateTeamUserMutation({
      id: this.props.teamUser.node.id,
      status,
    }));
  }

  render() {
    const { teamUser, isEditing } = this.props;

    const roles = [
      { value: 'annotator', label: this.props.intl.formatMessage(messages.annotator) },
      { value: 'contributor', label: this.props.intl.formatMessage(messages.contributor) },
      { value: 'journalist', label: this.props.intl.formatMessage(messages.journalist) },
      { value: 'editor', label: this.props.intl.formatMessage(messages.editor) },
      { value: 'owner', label: this.props.intl.formatMessage(messages.owner) },
    ];

    const assignmentsProgress = teamUser.node.assignments_progress;

    return (
      <ListItem
        className="team-members__member"
        key={teamUser.node.id}
        disabled
      >
        <FlexRow>
          <FlexRow>
            <Tooltip
              placement="top"
              overlay={<UserTooltip user={teamUser.node.user} team={teamUser.node.team} />}
            >
              <Link to={`/check/user/${teamUser.node.user.dbid}`} className="team-members__profile-link">
                <FlexRow>
                  <Offset isRtl={rtlDetect.isRtlLang(this.props.intl.locale)}>
                    <SourcePicture
                      className="avatar"
                      object={teamUser.node.user.source}
                      alt={teamUser.node.user.name}
                      size="small"
                      type="user"
                    />
                  </Offset>
                  <Text breakWord>
                    {teamUser.node.user.name}<br />
                    { assignmentsProgress.completed === 0 &&
                      assignmentsProgress.in_progress === 0 &&
                      assignmentsProgress.unstarted === 0 ? null :
                      <span style={{ fontSize: 11 }}>
                        <FormattedMessage
                          id="teamMembersListItem.assignmentsProgress"
                          defaultMessage="{completedCount} completed, {inProgressCount} in progress, {unstartedCount} unstarted"
                          values={{
                            completedCount: assignmentsProgress.completed,
                            inProgressCount: assignmentsProgress.in_progress,
                            unstartedCount: assignmentsProgress.unstarted,
                          }}
                        />
                      </span>
                    }
                  </Text>
                </FlexRow>
              </Link>
            </Tooltip>
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
                      <FormattedMessage id="TeamMembershipRequestsListItem.deny" defaultMessage="Reject" />
                    }
                  />
                </FlexRow>
              );
            }
            return (
              <FlexRow>
                <RoleSelect
                  onChange={this.handleRoleChange.bind(this)}
                  value={teamUser.node.role}
                  disabled={!isEditing || teamUser.node.status === 'banned'}
                />

                {isEditing && teamUser.node.status !== 'banned' ?
                  <IconButton
                    className="team-members__delete-member"
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
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  intl: intlShape.isRequired,
};

export default injectIntl(TeamMembersListItem);
