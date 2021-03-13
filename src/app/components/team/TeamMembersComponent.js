import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import { makeStyles } from '@material-ui/core/styles';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import ChangeUserRole from './ChangeUserRole';
import InviteDialog from './InviteDialog';
import SettingsHeader from './SettingsHeader';
import TeamMemberActions from './TeamMemberActions';
import { can } from '../Can';
import TimeBefore from '../TimeBefore';
import { ContentColumn } from '../../styles/js/shared';
import { StyledTwoColumns, StyledBigColumn, StyledSmallColumn } from '../../styles/js/HeaderCard';

const useStyles = makeStyles(theme => ({
  pending: {
    border: '1px solid black',
    padding: theme.spacing(0.5),
    marginTop: theme.spacing(0.5),
    borderRadius: '5px',
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
    <ContentColumn>
      <SettingsHeader
        title={
          <FormattedMessage
            id="teamMembers.title"
            defaultMessage="Members"
            description="Title for workspace members management page"
          />
        }
        subtitle={
          <FormattedMessage
            id="teamMembers.subtitle"
            defaultMessage="Invite and manage users"
          />
        }
        helpUrl="https://help.checkmedia.org/en/articles/3336431-permissions-in-check"
        actionButton={
          <Button
            id="team-members__invite-button"
            color="primary"
            disabled={!can(team.permissions, 'invite Members')}
            variant="contained"
            onClick={() => setInviteDialogOpen(true)}
          >
            <FormattedMessage
              id="teamMembers.invite"
              defaultMessage="Invite"
            />
          </Button>
        }
      />
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
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
                <TableCell>
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
              </TableRow>
            </TableHead>
            <TableBody>
              { sortedMembers.filter(tu => !tu.node.user.is_bot).map(tu => (
                <TableRow key={tu.node.id} className="team-members__user-row">
                  <TableCell>
                    <StyledTwoColumns>
                      <StyledSmallColumn>
                        <Avatar alt={tu.node.user.name} src={tu.node.user.profile_image} />
                      </StyledSmallColumn>
                      <StyledBigColumn>
                        { tu.node.status === 'invited' ? (
                          <React.Fragment>
                            <div>{tu.node.user.email}</div>
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
                            <div>{tu.node.user.name}</div>
                            <div>{tu.node.user.email}</div>
                          </React.Fragment>
                        )}
                      </StyledBigColumn>
                    </StyledTwoColumns>
                  </TableCell>
                  <TableCell>
                    { tu.node.user.last_active_at ?
                      <TimeBefore date={new Date(tu.node.user.last_active_at * 1000)} />
                      : '-'
                    }
                  </TableCell>
                  <TableCell>
                    <Box display="flex">
                      <ChangeUserRole teamUser={tu.node} />
                      <TeamMemberActions team={team} teamUser={tu.node} />
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <InviteDialog
          team={team}
          open={inviteDialogOpen}
          onClose={() => setInviteDialogOpen(false)}
        />
      </Card>
    </ContentColumn>
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
