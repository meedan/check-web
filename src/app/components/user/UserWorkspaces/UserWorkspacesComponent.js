import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import { commitMutation, graphql } from 'react-relay/compat';
import { browserHistory } from 'react-router';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import cx from 'classnames/bind';
import Tooltip from '../../cds/alerts-and-prompts/Tooltip';
import NextIcon from '../../../icons/chevron_right.svg';
import PrevIcon from '../../../icons/chevron_left.svg';
import BlankState from '../../layout/BlankState';
import SettingsHeader from '../../team/SettingsHeader';
import TeamAvatar from '../../team/TeamAvatar';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import CreateTeamDialog from '../../team/CreateTeamDialog';
import { FlashMessageSetterContext } from '../../FlashMessage';
import { getErrorMessageForRelayModernProblem } from '../../../helpers';
import { stringHelper } from '../../../customHelpers';
import styles from '../user.module.css';
import workspaceStyles from './UserWorkspacesComponent.module.css';
import MediasLoading from '../../media/MediasLoading';

const updateUserMutation = graphql`
  mutation UserWorkspacesComponentUpdateUserMutation($input: UpdateUserInput!) {
    updateUser(input: $input) {
      me {
        current_team_id
      }
    }
  }
`;

const UserWorkspacesComponent = ({
  teams,
  currentTeam,
  numberOfTeams,
  pageSize,
  totalCount,
  relay,
}) => {
  const [showCreateTeamDialog, setShowCreateTeamDialog] = React.useState(false);
  const [cursor, setCursor] = React.useState(0);
  const [isPaginationLoading, setIsPaginationLoading] = React.useState(false);
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
          current_team_id: team.dbid,
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
      { totalCount > pageSize && // only display paginator if there are more than pageSize worth of workspaces overall in the database
        <div className={cx('paginator', workspaceStyles['workspaces-wrapper'])}>
          <Tooltip
            arrow
            title={
              <FormattedMessage id="search.previousPage" defaultMessage="Previous page" description="Pagination button to go to previous page" />
            }
          >
            <span>
              <ButtonMain
                disabled={isPaginationLoading || cursor - pageSize < 0}
                variant="text"
                theme="brand"
                size="default"
                onClick={() => {
                  if (cursor - pageSize >= 0) {
                    setCursor(cursor - pageSize);
                  }
                }}
                iconCenter={<PrevIcon />}
              />
            </span>
          </Tooltip>
          <span className={cx('typography-button', styles['workspace-header-count'])}>
            <FormattedMessage
              id="searchResults.itemsCount"
              defaultMessage="{totalCount, plural, one {1 / 1} other {{from} - {to} / #}}"
              description="Pagination count of items returned"
              values={{
                from: cursor + 1,
                to: Math.min(cursor + pageSize, totalCount),
                totalCount,
              }}
            />
          </span>
          <Tooltip
            title={
              <FormattedMessage id="search.nextPage" defaultMessage="Next page" description="Pagination button to go to next page" />
            }
          >
            <span>
              <ButtonMain
                disabled={isPaginationLoading || cursor + pageSize >= totalCount}
                variant="text"
                theme="brand"
                size="default"
                onClick={() => {
                  if (relay.hasMore() && !relay.isLoading() && (cursor + pageSize >= teams.length)) {
                    setIsPaginationLoading(true);
                    relay.loadMore(pageSize, () => {
                      setCursor(cursor + pageSize);
                      setIsPaginationLoading(false);
                    });
                  } else if (cursor + pageSize < teams.length) {
                    setCursor(cursor + pageSize);
                  }
                }}
                iconCenter={<NextIcon />}
              />
            </span>
          </Tooltip>
        </div>
      }
      <div className={styles['user-setting-details-wrapper']}>
        { teams.length ?
          <div className={styles['user-setting-content-container']}>
            { isPaginationLoading && <MediasLoading size="medium" theme="grey" variant="inline" /> }
            <ul className={cx('teams', styles['user-setting-content-list'])}>
              {teams.slice(cursor, cursor + pageSize).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })).map(team => (
                <ListItem
                  key={team.slug}
                  className={cx(workspaceStyles['list-item'], currentTeam === team.dbid && teams.length > 1 && workspaceStyles['current-active-item'])}
                  onClick={() => setCurrentTeam(team)}
                  to={`/${team.slug}/all-items`}
                  id={`switch-teams__link-to-${team.slug}`}
                >
                  <ListItemAvatar>
                    <TeamAvatar team={{ avatar: team.avatar }} size="32px" />
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
                      iconCenter={<NextIcon />}
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
          <div className={cx('no-workspaces', styles['user-setting-content-container'])}>
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

UserWorkspacesComponent.propTypes = {
  numberOfTeams: PropTypes.number.isRequired,
  teams: PropTypes.arrayOf(PropTypes.shape({
    dbid: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    avatar: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    members_count: PropTypes.number.isRequired,
  }).isRequired).isRequired,
  pageSize: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  currentTeam: PropTypes.number.isRequired,
};

export default UserWorkspacesComponent;
