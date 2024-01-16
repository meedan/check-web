/* eslint-disable relay/unused-fields */
import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import { makeStyles } from '@material-ui/core/styles';
import cx from 'classnames/bind';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import ChangeUserRole from './ChangeUserRole';
import InviteDialog from './InviteDialog';
import SettingsHeader from './SettingsHeader';
import TeamMemberActions from './TeamMemberActions';
import { can } from '../Can';
import TimeBefore from '../TimeBefore';
import { StyledTwoColumns, StyledSmallColumn } from '../../styles/js/HeaderCard';
import settingsStyles from './Settings.module.css';
import KeyboardArrowDownIcon from '../../icons/chevron_down.svg';

const useStyles = makeStyles(theme => ({
  pending: {
    border: '1px solid var(--textPrimary)',
    padding: theme.spacing(0.5),
    marginTop: theme.spacing(0.5),
    borderRadius: '5px',
  },
  mainCell: {
    maxWidth: theme.spacing(60),
    overflow: 'hidden',
  },
  dateCell: {
    minWidth: theme.spacing(18),
    whiteSpace: 'nowrap',
  },
  textEllipsis: {
    maxWidth: theme.spacing(40),
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));

const TeamMembersComponent = ({
  team,
}) => {
  const [inviteDialogOpen, setInviteDialogOpen] = React.useState(false);
  const [sortParam, setSortParam] = React.useState(null);
  const [sortDirection, setSortDirection] = React.useState('asc');
  const classes = useStyles();

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
        title={
          <FormattedMessage
            id="teamMembers.title"
            defaultMessage="Members [{membersCount}]"
            description="Title for workspace members management page"
            values={{ membersCount: sortedMembers.filter(tu => !tu.node.user.is_bot).length }}
          />
        }
        context={
          <FormattedHTMLMessage
            id="teamMembers.helpContext"
            defaultMessage='Manage your Check workspace’s members. <a href="{helpLink}" target="_blank" title="Learn more">Learn more about member roles</a>.'
            values={{ helpLink: 'https://help.checkmedia.org/en/articles/3336431-permissions-in-check' }}
            description="Context description for the functionality of this page"
          />
        }
        actionButton={
          <ButtonMain
            theme="brand"
            size="default"
            variant="contained"
            disabled={!can(team.permissions, 'invite Members')}
            onClick={() => setInviteDialogOpen(true)}
            label={
              <FormattedMessage
                id="teamMembers.invite"
                defaultMessage="Invite"
                description="Button label for main action to start the process of inviting team members to this workspace"
              />
            }
            buttonProps={{
              id: 'team-members__invite-button',
            }}
          />
        }
      />
      <div className={cx(settingsStyles['setting-details-wrapper'])}>
        <div className={settingsStyles['setting-content-container']}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className={classes.mainCell}>
                  <FormattedMessage
                    id="teamMembers.tableHeaderName"
                    defaultMessage="Name"
                    description="Column header in members table."
                  >
                    { text => (
                      <TableSortLabel
                        active={sortParam === 'name'}
                        direction={sortDirection || undefined}
                        onClick={() => toggleSort('name')}
                        IconComponent={KeyboardArrowDownIcon}
                      >
                        {text}
                      </TableSortLabel>
                    )}
                  </FormattedMessage>
                </TableCell>
                <TableCell className={classes.dateCell}>
                  <FormattedMessage
                    id="teamMembers.tableHeaderLastActive"
                    defaultMessage="Last active"
                    description="Column header in members table."
                  >
                    { text => (
                      <TableSortLabel
                        active={sortParam === 'last_active_at'}
                        direction={sortDirection || undefined}
                        onClick={() => toggleSort('last_active_at')}
                        IconComponent={KeyboardArrowDownIcon}
                      >
                        {text}
                      </TableSortLabel>
                    )}
                  </FormattedMessage>
                </TableCell>
                <TableCell>
                  <FormattedMessage
                    id="teamMembers.tableHeaderRole"
                    defaultMessage="Workspace permission"
                    description="Column header in members table."
                  >
                    { text => (
                      <TableSortLabel
                        active={sortParam === 'role'}
                        direction={sortDirection || undefined}
                        onClick={() => toggleSort('role')}
                        IconComponent={KeyboardArrowDownIcon}
                      >
                        {text}
                      </TableSortLabel>
                    )}
                  </FormattedMessage>
                </TableCell>
                <TableCell padding="checkbox" />
              </TableRow>
            </TableHead>
            <TableBody>
              { sortedMembers.filter(tu => !tu.node.user.is_bot).map(tu => (
                <TableRow key={tu.node.id} className="team-members__user-row">
                  <TableCell className={classes.mainCell}>
                    <StyledTwoColumns>
                      <StyledSmallColumn>
                        <Avatar alt={tu.node.user.name} src={tu.node.user.profile_image} />
                      </StyledSmallColumn>
                      <div style={{ flex: '3' }}>
                        { tu.node.status === 'invited' ? (
                          <React.Fragment>
                            <div
                              title={tu.node.user.email}
                              className={classes.textEllipsis}
                            >
                              {tu.node.user.email}
                            </div>
                            <Box mt={0.5}>
                              <span className={classes.pending}>
                                <FormattedMessage
                                  id="teamMembers.pending"
                                  defaultMessage="Pending"
                                  description="Label for invite pending acceptance"
                                />
                              </span>
                            </Box>
                          </React.Fragment>
                        ) : (
                          <React.Fragment>
                            <div className={classes.textEllipsis}>{tu.node.user.name}</div>
                            <div
                              title={tu.node.user.email}
                              className={classes.textEllipsis}
                            >
                              {tu.node.user.email}
                            </div>
                          </React.Fragment>
                        )}
                      </div>
                    </StyledTwoColumns>
                  </TableCell>
                  <TableCell className={classes.dateCell}>
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
            </TableBody>
          </Table>
          <InviteDialog
            team={team}
            open={inviteDialogOpen}
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
