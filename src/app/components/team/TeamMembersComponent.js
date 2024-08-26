/* eslint-disable relay/unused-fields */
import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import Avatar from '@material-ui/core/Avatar';
import Table from '@material-ui/core/Table';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import cx from 'classnames/bind';
import ChangeUserRole from './ChangeUserRole';
import InviteDialog from './InviteDialog';
import SettingsHeader from './SettingsHeader';
import TeamMemberActions from './TeamMemberActions';
import { can } from '../Can';
import TimeBefore from '../TimeBefore';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import KeyboardArrowDownIcon from '../../icons/chevron_down.svg';
import ScheduleSendIcon from '../../icons/schedule_send.svg';
import settingsStyles from './Settings.module.css';

const TeamMembersComponent = ({
  team,
}) => {
  const [inviteDialogOpen, setInviteDialogOpen] = React.useState(false);
  const [sortParam, setSortParam] = React.useState(null);
  const [sortDirection, setSortDirection] = React.useState('asc');

  const toggleSort = (param) => {
    setSortParam(param);
    if (sortParam === param) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortDirection('asc');
    }
  };

  const sortFunc = {
    name: (a, b) => (a.node.user.name > b.node.user.name ? 1 : -1) * (sortDirection === 'asc' ? 1 : -1),
    last_active_at: (a, b) => ((a.node.user.last_active_at > b.node.user.last_active_at) ? 1 : -1) * (sortDirection === 'asc' ? 1 : -1),
    role: (a, b) => ((a.node.role > b.node.role) ? 1 : -1) * (sortDirection === 'asc' ? 1 : -1),
  };

  const sortedMembers = sortParam ?
    team.team_users.edges.slice().sort(sortFunc[sortParam]) :
    team.team_users.edges;

  return (
    <>
      <SettingsHeader
        actionButton={
          <ButtonMain
            buttonProps={{
              id: 'team-members__invite-button',
            }}
            disabled={!can(team.permissions, 'invite Members')}
            label={
              <FormattedMessage
                defaultMessage="Invite"
                description="Button label for main action to start the process of inviting team members to this workspace"
                id="teamMembers.invite"
              />
            }
            size="default"
            theme="info"
            variant="contained"
            onClick={() => setInviteDialogOpen(true)}
          />
        }
        context={
          <FormattedHTMLMessage
            defaultMessage='Manage your Check workspace’s members. <a href="{helpLink}" target="_blank" title="Learn more">Learn more about member roles</a>.'
            description="Context description for the functionality of this page"
            id="teamMembers.helpContext"
            values={{ helpLink: 'https://help.checkmedia.org/en/articles/8712107-team-settings#h_2767b2d557' }}
          />
        }
        title={
          <FormattedMessage
            defaultMessage="Members [{membersCount}]"
            description="Title for workspace members management page"
            id="teamMembers.title"
            values={{ membersCount: sortedMembers.filter(tu => !tu.node.user.is_bot).length }}
          />
        }
      />
      <div className={cx(settingsStyles['setting-details-wrapper'])}>
        <div className={settingsStyles['setting-content-container']}>
          <Table className={settingsStyles['teammembers-table']}>
            <TableHead>
              <TableRow>
                <TableCell className={settingsStyles['main-cell']}>
                  <FormattedMessage
                    defaultMessage="Name"
                    description="Column header in members table."
                    id="teamMembers.tableHeaderName"
                  >
                    { text => (
                      <TableSortLabel
                        IconComponent={KeyboardArrowDownIcon}
                        active={sortParam === 'name'}
                        direction={sortDirection || undefined}
                        onClick={() => toggleSort('name')}
                      >
                        {text}
                      </TableSortLabel>
                    )}
                  </FormattedMessage>
                </TableCell>
                <TableCell className={settingsStyles['date-cell']}>
                  <FormattedMessage
                    defaultMessage="Last active"
                    description="Column header in members table."
                    id="teamMembers.tableHeaderLastActive"
                  >
                    { text => (
                      <TableSortLabel
                        IconComponent={KeyboardArrowDownIcon}
                        active={sortParam === 'last_active_at'}
                        direction={sortDirection || undefined}
                        onClick={() => toggleSort('last_active_at')}
                      >
                        {text}
                      </TableSortLabel>
                    )}
                  </FormattedMessage>
                </TableCell>
                <TableCell>
                  <FormattedMessage
                    defaultMessage="Workspace permission"
                    description="Column header in members table."
                    id="teamMembers.tableHeaderRole"
                  >
                    { text => (
                      <TableSortLabel
                        IconComponent={KeyboardArrowDownIcon}
                        active={sortParam === 'role'}
                        direction={sortDirection || undefined}
                        onClick={() => toggleSort('role')}
                      >
                        {text}
                      </TableSortLabel>
                    )}
                  </FormattedMessage>
                </TableCell>
                <TableCell padding="checkbox" />
              </TableRow>
            </TableHead>
            <tbody>
              { sortedMembers.filter(tu => !tu.node.user.is_bot).map(tu => (
                <TableRow className="team-members__user-row" key={tu.node.id}>
                  <TableCell className={settingsStyles['main-cell']}>
                    <div className={settingsStyles['teammembers-table-identity']}>
                      { tu.node.status === 'invited' ? (
                        <div className={settingsStyles['teammembers-table-identity-pending']}>
                          <ScheduleSendIcon />
                        </div>
                      ) : (
                        <Avatar alt={tu.node.user.name} src={tu.node.user.profile_image} />
                      )}
                      <div
                        className={cx(
                          settingsStyles['teammembers-table-identity-status'],
                          {
                            [settingsStyles['teammembers-table-identity-invited']]: tu.node.status === 'invited',
                          })
                        }
                      >
                        { tu.node.status === 'invited' ? (
                          <React.Fragment>
                            <FormattedMessage
                              defaultMessage="Invitation Sent - pending"
                              description="Label for invite pending acceptance"
                              id="teamMembers.pending"
                            />
                            <small
                              className={settingsStyles['text-truncate']}
                              title={tu.node.user.email}
                            >
                              {tu.node.user.email}
                            </small>
                          </React.Fragment>
                        ) : (
                          <React.Fragment>
                            <div className={settingsStyles['text-truncate']}>
                              {tu.node.user.name}
                            </div>
                            { tu.node.user.email &&
                              <div
                                className={settingsStyles['text-truncate']}
                                title={tu.node.user.email}
                              >
                                {tu.node.user.email}
                              </div>
                            }
                          </React.Fragment>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className={settingsStyles['date-cell']}>
                    { tu.node.user.last_active_at ?
                      <TimeBefore date={new Date(tu.node.user.last_active_at * 1000)} />
                      : '-'
                    }
                  </TableCell>
                  <TableCell>
                    <ChangeUserRole teamUser={tu.node} />
                  </TableCell>
                  <TableCell>
                    <TeamMemberActions team={team} teamUser={tu.node} />
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
          <InviteDialog
            open={inviteDialogOpen}
            team={team}
            onClose={() => setInviteDialogOpen(false)}
          />
        </div>
      </div>
    </>
  );
};

TeamMembersComponent.propTypes = {
  team: PropTypes.shape({
    team_users: PropTypes.shape({
      edges: PropTypes.arrayOf(PropTypes.shape({
        node: PropTypes.shape({
          id: PropTypes.string.isRequired,
          status: PropTypes.string.isRequired,
          role: PropTypes.string.isRequired,
          user: PropTypes.shape({
            id: PropTypes.string.isRequired,
            dbid: PropTypes.number.isRequired,
            is_bot: PropTypes.bool.isRequired,
            name: PropTypes.string.isRequired,
            email: PropTypes.string.isRequired,
            profile_image: PropTypes.string.isRequired,
          }).isRequired,
        }).isRequired,
      }).isRequired),
    }).isRequired,
  }).isRequired,
};

export default createFragmentContainer(TeamMembersComponent, {
  team: graphql`
    fragment TeamMembersComponent_team on Team {
      id
      permissions
      ...TeamMemberActions_team
      team_users(first: 10000, status: ["invited", "member", "banned"]) {
        edges {
          node {
            id
            status
            role
            user {
              id
              dbid
              email
              is_bot
              last_active_at
              name
              profile_image
            }
            ...TeamMemberActions_teamUser
            ...ChangeUserRole_teamUser
          }
        }
      }
    }
  `,
});
