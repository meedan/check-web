import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import { commitMutation, createPaginationContainer, graphql } from 'react-relay/compat';
import cx from 'classnames/bind';
import NextIcon from '../../../icons/chevron_right.svg';
import BlankState from '../../layout/BlankState';
import SettingsHeader from '../../team/SettingsHeader';
import TeamAvatar from '../../team/TeamAvatar';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import CreateTeamDialog from '../../team/CreateTeamDialog';
import { FlashMessageSetterContext } from '../../FlashMessage';
import { getErrorMessageForRelayModernProblem } from '../../../helpers';
import { stringHelper } from '../../../customHelpers';
import Loader from '../../cds/loading/Loader';
import Paginator from '../../cds/inputs/Paginator';
import styles from '../../team/Settings.module.css';

const updateUserMutation = graphql`
  mutation PaginatedUserWorkspacesUpdateUserMutation($input: UpdateUserInput!) {
    updateUser(input: $input) {
      me {
        current_team_id
      }
    }
  }
`;

const userWorkspacesQuery = graphql`
  query PaginatedUserWorkspacesQuery($pageSize: Int!, $after: String) {
    me {
      ...PaginatedUserWorkspaces_root
    }
  }
`;

const UserWorkspacesComponent = ({
  currentTeam,
  numberOfTeams,
  pageSize,
  relay,
  teams,
  totalCount,
}) => {
  const [showCreateTeamDialog, setShowCreateTeamDialog] = React.useState(false);
  const [cursor, setCursor] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [isPaginationLoading, setIsPaginationLoading] = React.useState(false);
  const setFlashMessage = React.useContext(FlashMessageSetterContext);

  const onFailure = (errors) => {
    const errorMessage = getErrorMessageForRelayModernProblem(errors) || <FormattedMessage
      defaultMessage="Sorry, an error occurred while updating the workspace. Please try again and contact {supportEmail} if the condition persists."
      description="Error message with instructions on how to contact support"
      id="switchTeams.error"
      values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
    />;
    setFlashMessage(errorMessage, 'error');
  };

  const onSuccess = (team) => {
    /* While debugging an error related to creating tipline resources, I realized it occurred only
       when navigating to the tipline settings page directly from the Workspaces list (i.e., switching
       from one workspace to another). The resource isn't created because the workspace ID being used
       is still the previous one. As a result, the session isn't fully cleared or switched to the new
       workspace. The simplest fix is to force a hard refresh to ensure a completely new session under
       the new workspace. */
    window.location.assign(`/${team.slug}/all-items`);
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

  const handlePageChange = (newPage) => {
    if (newPage > page) {
      if (relay.hasMore() && !relay.isLoading() && (cursor + pageSize >= teams.length)) {
        setIsPaginationLoading(true);
        relay.loadMore(pageSize, () => {
          setCursor(cursor + pageSize);
          setIsPaginationLoading(false);
          setPage(newPage);
        });
      } else if (cursor + pageSize < teams.length) {
        setCursor(cursor + pageSize);
        setPage(newPage);
      }
    } else if (cursor - pageSize >= 0) {
      setCursor(cursor - pageSize);
      setPage(newPage);
    }
  };

  return (
    <>
      <SettingsHeader
        actionButton={
          <ButtonMain
            label={
              <FormattedMessage defaultMessage="Create" description="Button label for initiating creating a new team workspace" id="switchTeams.newTeamLink" />
            }
            size="default"
            theme="info"
            variant="contained"
            onClick={() => setShowCreateTeamDialog(true)}
          />
        }
        title={
          <FormattedMessage
            defaultMessage="Workspaces [{workspacesCount}]"
            description="Title for user settings area for user workspaces list they are a memeber of"
            id="userSettings.workspacesTitle"
            values={{ workspacesCount: numberOfTeams || 0 }}
          />
        }
      />
      { totalCount > pageSize && // only display paginator if there are more than pageSize worth of workspaces overall in the database
        <Paginator
          numberOfPageResults={cursor + pageSize >= totalCount ? totalCount % pageSize : pageSize}
          numberOfTotalResults={totalCount}
          page={page}
          pageSize={pageSize}
          onChangePage={handlePageChange}
        />
      }
      <div className={styles['setting-details-wrapper']}>
        { teams.length ?
          <div className={styles['setting-content-container']}>
            { isPaginationLoading && <Loader size="medium" theme="grey" variant="inline" /> }
            <ul className={cx('teams', styles['setting-content-list'])}>
              {teams.slice(cursor, cursor + pageSize).map(team => (
                // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
                <li
                  className={cx(styles['clickable-list-item'], currentTeam === team.dbid && teams.length > 1 && styles['current-active-item'])}
                  id={`switch-teams__link-to-${team.slug}`}
                  key={team.slug}
                  to={`/${team.slug}/all-items`}
                  onClick={() => setCurrentTeam(team)}
                >
                  <div className={styles['team-avatar']}>
                    <TeamAvatar size="32px" team={{ avatar: team.avatar }} />
                  </div>
                  <div>
                    <strong>{team.name}</strong>
                    <br />
                    <FormattedMessage
                      defaultMessage="{membersCount, plural, one {# member} other {# members}}"
                      description="Count of members of a workspace"
                      id="switchTeams.member"
                      tagName="small"
                      values={{ membersCount: team.members_count }}
                    />
                  </div>
                  <div className={styles['setting-content-list-actions']}>
                    <ButtonMain
                      iconCenter={<NextIcon />}
                      size="default"
                      theme="text"
                      variant="outlined"
                      onClick={() => setCurrentTeam(team)}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div> :
          <div className={cx('no-workspaces', styles['setting-content-container'])}>
            <BlankState>
              <FormattedMessage defaultMessage="Not a member of any workspace." description="Empty message when the user is not a member of a workspace" id="switchTeams.noTeams" />
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
  currentTeam: PropTypes.number.isRequired,
  numberOfTeams: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  teams: PropTypes.arrayOf(PropTypes.shape({
    dbid: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    avatar: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    members_count: PropTypes.number.isRequired,
  }).isRequired).isRequired,
  totalCount: PropTypes.number.isRequired,
};


const PaginatedUserWorkspaces = createPaginationContainer(
  props => (
    <UserWorkspacesComponent
      currentTeam={props.root.current_team_id}
      numberOfTeams={props.root.accessible_teams_count}
      pageSize={props.pageSize}
      relay={props.relay}
      teams={props.root.accessible_teams.edges.map(edge => edge.node) || []}
      totalCount={props.root.accessible_teams?.totalCount}
    />
  ),
  {
    root: graphql`
      fragment PaginatedUserWorkspaces_root on Me {
        current_team_id
        accessible_teams_count
        accessible_teams(first: $pageSize, after: $after) @connection(key: "PaginatedUserWorkspaces_accessible_teams") {
          edges {
            node {
              dbid
              name
              avatar
              slug
              members_count
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
          totalCount
        }
      }
    `,
  },
  {
    direction: 'forward',
    query: userWorkspacesQuery,
    getConnectionFromProps: props => props.root.accessible_teams,
    getFragmentVariables: (previousVars, pageSize) => ({
      ...previousVars,
      pageSize,
    }),
    getVariables: (props, paginationInfo, fragmentVariables) => ({
      pageSize: fragmentVariables.pageSize,
      after: paginationInfo.cursor,
    }),
  },
);
// for unit tests
// eslint-disable-next-line import/no-unused-modules
export { UserWorkspacesComponent };
export default PaginatedUserWorkspaces;
