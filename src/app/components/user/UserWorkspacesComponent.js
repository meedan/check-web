import React from 'react';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import { commitMutation, graphql } from 'react-relay/compat';
import { browserHistory } from 'react-router';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import cx from 'classnames/bind';
import BlankState from '../layout/BlankState';
import SettingsHeader from '../team/SettingsHeader';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import CreateTeamDialog from '../team/CreateTeamDialog';
// todo: use updated error handling
import { FlashMessageSetterContext } from '../FlashMessage';
import { getErrorMessageForRelayModernProblem } from '../../helpers';
import { stringHelper } from '../../customHelpers';
import KeyboardArrowRight from '../../icons/chevron_right.svg';
import styles from './user.module.css';
import TeamAvatar from '../team/TeamAvatar';

const updateUserMutation = graphql`
  mutation UserWorkspacesComponentUpdateUserMutation($input: UpdateUserInput!) {
    updateUser(input: $input) {
      me {
        current_team {
          id
        }
      }
    }
  }
`;

const UserWorkspacesComponent = (
  teams,
  numberOfTeams,
) => {
  const [showCreateTeamDialog, setShowCreateTeamDialog] = React.useState(false);
  const setFlashMessage = React.useContext(FlashMessageSetterContext);

  const onFailure = (errors) => {
    const errorMessage = getErrorMessageForRelayModernProblem(errors) || <FormattedMessage
      id="switchTeams.error"
      defaultMessage="Sorry, an error occurred while updating the workspace. Please try again and contact {supportEmail} if the condition persists."
      description="Error message with instructions on how to contact support"
      values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
    />;
    setFlashMessage(errorMessage, 'error');
  };

  const onSuccess = (team) => {
    const path = `/${team.slug}/all-items`;
    browserHistory.push(path);
  };

  const setCurrentTeam = (team) => {
    commitMutation(Relay.Store, {
      mutation: updateUserMutation,
      variables: {
        input: {
          current_team: team,
        },
      },
      onCompleted: ({ error }) => {
        if (error) {
          onFailure(error);
        } else {
          onSuccess(team);
        }
      },
      onError: onFailure,
    });
  };

  const handleCancelCreateTeam = () => {
    setShowCreateTeamDialog(false);
  };

  return (
    <>
      <SettingsHeader
        title={
          <FormattedMessage
            id="userSettings.workspacesTitle"
            defaultMessage="Workspaces [{workspacesCount}]"
            description="Title for user settings area for user workspaces list they are a memeber of"
            values={{ workspacesCount: numberOfTeams || 0 }}
          />
        }
        actionButton={
          <ButtonMain
            theme="brand"
            size="default"
            variant="contained"
            onClick={() => setShowCreateTeamDialog(true)}
            label={
              <FormattedMessage id="switchTeams.newTeamLink" defaultMessage="Create" description="Button label for initiating creating a new team workspace" />
            }
          />
        }
      />
      <div className={styles['user-setting-details-wrapper']}>
        { teams.length ?
          <div className={styles['user-setting-content-container']}>
            <ul className={cx('teams', styles['user-setting-content-list'])}>
              {teams.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })).map(team => (
                <ListItem
                  key={team.slug}
                  className="switch-teams__joined-team"
                  onClick={() => setCurrentTeam(team)}
                  to={`/${team.slug}/all-items`}
                  id={`switch-teams__link-to-${team.slug}`}
                >
                  <ListItemAvatar>
                    <TeamAvatar src={team.avatar} size="32px" />
                  </ListItemAvatar>
                  <ListItemText
                    primary={team.name}
                    style={{ color: 'var(--color-gray-15)' }}
                    secondary={
                      <FormattedMessage
                        id="switchTeams.member"
                        defaultMessage="{membersCount, plural, one {# member} other {# members}}"
                        description="Count of members of a workspace"
                        values={{ membersCount: team.members_count }}
                      />
                    }
                  />
                  <ListItemSecondaryAction>
                    <ButtonMain
                      iconCenter={<KeyboardArrowRight />}
                      theme="text"
                      variant="text"
                      size="default"
                      onClick={() => setCurrentTeam(team)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </ul>
          </div> :
          <div className={styles['user-setting-content-container']}>
            <BlankState>
              <FormattedMessage id="switchTeams.noTeams" defaultMessage="Not a member of any workspace." description="Empty message when the user is not a member of a workspace" />
            </BlankState>
          </div>
        }
        { showCreateTeamDialog &&
          <CreateTeamDialog onDismiss={handleCancelCreateTeam} />
        }
      </div>
    </>
  );
};

export default UserWorkspacesComponent;
