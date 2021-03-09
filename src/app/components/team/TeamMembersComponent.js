import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import ChangeUserRole from './ChangeUserRole';
import InviteDialog from './InviteDialog';
import SettingsHeader from './SettingsHeader';
import TeamMemberActions from './TeamMemberActions';
import { ContentColumn } from '../../styles/js/shared';
import { StyledTwoColumns, StyledBigColumn, StyledSmallColumn } from '../../styles/js/HeaderCard';

const TeamMembersComponent = ({
  team,
}) => {
  const [inviteDialogOpen, setInviteDialogOpen] = React.useState(false);

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
            className="team-members__invite-button"
            color="primary"
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
                  />
                </TableCell>
                <TableCell>
                  <FormattedMessage
                    id="teamMembers.tableHeaderLastActive"
                    defaultMessage="Last active"
                    description="Column header in members table."
                  />
                </TableCell>
                <TableCell>
                  <FormattedMessage
                    id="teamMembers.tableHeaderRole"
                    defaultMessage="Workspace permission"
                    description="Column header in members table."
                  />
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              { team.team_users.edges.filter(tu => !tu.node.user.is_bot).map(tu => (
                <TableRow key={tu.node.id}>
                  <TableCell>
                    <StyledTwoColumns>
                      <StyledSmallColumn>
                        <Avatar alt={tu.node.user.name} src={tu.node.user.profile_image} />
                      </StyledSmallColumn>
                      <StyledBigColumn>
                        { tu.node.status === 'invited' ? (
                          <React.Fragment>
                            <div>{tu.node.user.email}</div>
                            <div>
                              <FormattedMessage
                                id="teamMembers.pending"
                                defaultMessage="Pending"
                                description="Label for invite pending acceptance"
                              />
                            </div>
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
                    { /* FIXME: Add last active data */ }
                    -
                  </TableCell>
                  <TableCell>
                    <ChangeUserRole teamUser={tu.node} />
                    <TeamMemberActions team={team} teamUser={tu.node} />
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
