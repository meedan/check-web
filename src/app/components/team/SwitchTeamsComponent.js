import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage, defineMessages, intlShape, injectIntl } from 'react-intl';
import KeyboardArrowRight from 'material-ui/svg-icons/hardware/keyboard-arrow-right';
import { Link } from 'react-router';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import { List, ListItem } from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import styled from 'styled-components';
import {
  alertRed,
  highlightBlue,
  checkBlue,
  defaultBorderRadius,
  defaultBorderWidth,
  opaqueBlack87,
  borderWidthMedium,
  tiny,
  units,
  titleStyle,
  listStyle,
  listItemButtonStyle,
  white,
  black05,
} from '../../styles/js/shared';
import UpdateUserMutation from '../../relay/mutations/UpdateUserMutation';
import DeleteTeamUserMutation from '../../relay/mutations/DeleteTeamUserMutation';
import CheckContext from '../../CheckContext';
import { can } from '../Can';
import { getErrorMessage } from '../../helpers';
import { stringHelper } from '../../customHelpers';

const messages = defineMessages({
  switchTeamsError: {
    id: 'switchTeams.error',
    defaultMessage: 'Sorry, an error occurred while updating the workspace. Please try again and contact {supportEmail} if the condition persists.',
  },
  switchTeamsMember: {
    id: 'switchTeams.member',
    defaultMessage: '{membersCount, plural, =0 {No members} one {1 member} other {# members}}',
  },
  joinTeam: {
    id: 'switchTeams.joinRequestMessage',
    defaultMessage: 'You requested to join',
  },
});

class SwitchTeamsComponent extends Component {
  getContext() {
    return new CheckContext(this);
  }

  setCurrentTeam(team, user) {
    const context = this.getContext();
    const { history, currentUser } = context.getContextStore();

    currentUser.current_team = team;
    context.setContextStore({ team, currentUser });

    const onFailure = (transaction) => {
      const fallbackMessage = this.props.intl.formatMessage(messages.switchTeamsError, { supportEmail: stringHelper('SUPPORT_EMAIL') });
      const message = getErrorMessage(transaction, fallbackMessage);
      this.context.setMessage(message);
    };

    const onSuccess = () => {
      const path = `/${team.slug}/all-items`;
      history.push(path);
    };

    Relay.Store.commitUpdate(
      new UpdateUserMutation({
        current_team_id: team.dbid,
        current_user_id: user.id,
      }),
      { onSuccess, onFailure },
    );
  }

  cancelRequest(team, e) {
    Relay.Store.commitUpdate(new DeleteTeamUserMutation({
      id: team.teamUser_id,
      user: this.props.user,
    }));
    e.preventDefault();
  }

  render() {
    const { user, user: { team_users: { edges: teamUsers } } } = this.props;
    const { currentUser } = this.getContext().getContextStore();
    const isUserSelf = (user.id === currentUser.id);
    const joinedTeams = [];
    const pendingTeams = [];

    const ListItemContainer = styled.div`
      position: relative;
      .team__badge {
        background-color: ${opaqueBlack87};
        border-radius: ${borderWidthMedium};
        color: ${white};
        font: ${tiny};
        line-height: 1.2;
        padding: ${units(0.25)} ${units(0.5)};
        position: absolute;
        ${props => props.isRtl ? 'right' : 'left'}: ${units(5)};
        top: ${units(2.5)};
        text-transform: uppercase;
        z-index: 9999;
      }
    `;

    const teamAvatarStyle = {
      border: `${defaultBorderWidth} solid ${black05}`,
      borderRadius: `${defaultBorderRadius}`,
      backgroundColor: white,
    };

    teamUsers.forEach((teamUser) => {
      const { team, status } = teamUser.node;

      if (can(team.permissions, 'read Team')) {
        if (status === 'member') {
          joinedTeams.push(team);
        } else if (isUserSelf && status === 'requested') {
          team.status = status;
          team.teamUser_id = teamUser.node.id;
          pendingTeams.push(team);
        }
      }
    });

    const cardTitle = isUserSelf ?
      <FormattedMessage id="teams.yourTeams" defaultMessage="Your workspaces" /> :
      <FormattedMessage id="teams.userTeams" defaultMessage="{name}'s workspaces" values={{ name: user.name }} />;

    return (
      <Card>
        <CardHeader
          titleStyle={titleStyle}
          title={cardTitle}
        />
        { (joinedTeams.length + pendingTeams.length) ?
          <List className="teams" style={listStyle}>
            {joinedTeams.map(team => (
              <ListItemContainer key={`team-${team.dbid}`} isRtl={this.props.isRtl}>
                <ListItem
                  className="switch-teams__joined-team"
                  hoverColor={highlightBlue}
                  focusRippleColor={checkBlue}
                  touchRippleColor={checkBlue}
                  containerElement={<Link to={`/${team.slug}/all-items`} />}
                  leftAvatar={<Avatar style={teamAvatarStyle} src={team.avatar} />}
                  onClick={this.setCurrentTeam.bind(this, team, currentUser)}
                  primaryText={team.name}
                  rightIcon={<KeyboardArrowRight />}
                  secondaryText={this.props.intl.formatMessage(messages.switchTeamsMember, {
                    membersCount: team.members_count,
                  })}
                />
              </ListItemContainer>
            ))}

            {pendingTeams.map(team => (
              <ListItem
                className="switch-teams__pending-team"
                key={`team-${team.dbid}`}
                hoverColor={highlightBlue}
                focusRippleColor={checkBlue}
                touchRippleColor={checkBlue}
                containerElement={<Link to={`/${team.slug}`} />}
                leftAvatar={<Avatar style={teamAvatarStyle} src={team.avatar} />}
                primaryText={team.name}
                rightIconButton={
                  <Button
                    className="switch-team__cancel-request"
                    style={listItemButtonStyle}
                    hoverColor={alertRed}
                    onClick={this.cancelRequest.bind(this, team)}
                  >
                    <FormattedMessage id="switchTeams.cancelJoinRequest" defaultMessage="Cancel" />
                  </Button>
                }
                secondaryText={this.props.intl.formatMessage(messages.joinTeam)}
              />
            ))}
          </List> :
          <CardContent>
            <FormattedMessage id="switchTeams.noTeams" defaultMessage="Not a member of any workspace." />
          </CardContent>
        }

        { isUserSelf ?
          <CardActions>
            <Button
              onClick={() => this.getContext().getContextStore().history.push('/check/teams/new')}
            >
              <FormattedMessage id="switchTeams.newTeamLink" defaultMessage="Create Workspace" />
            </Button>
          </CardActions> : null
        }
      </Card>
    );
  }
}

SwitchTeamsComponent.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  intl: intlShape.isRequired,
  user: PropTypes.object.isRequired,
};

SwitchTeamsComponent.contextTypes = {
  store: PropTypes.object,
  setMessage: PropTypes.func,
};

export default injectIntl(SwitchTeamsComponent);
