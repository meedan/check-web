import React from 'react';
import Relay from 'react-relay/classic';
import { commitMutation, graphql } from 'react-relay/compat';
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
import InviteDialog from './InviteDialog';
import RoleSelect from './RoleSelect';
import SettingsHeader from './SettingsHeader';
import TeamMemberActions from './TeamMemberActions';
import { withSetFlashMessage } from '../FlashMessage';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import { ContentColumn } from '../../styles/js/shared';
import { StyledTwoColumns, StyledBigColumn, StyledSmallColumn } from '../../styles/js/HeaderCard';
import { getErrorMessageForRelayModernProblem } from '../../helpers';

const TeamMembersComponent = ({
  team,
  setFlashMessage,
}) => {
  const [inviteDialogOpen, setInviteDialogOpen] = React.useState(false);

  const handleChangeRole = (id, role) => {
    const onFailure = (errors) => {
      setFlashMessage((
        getErrorMessageForRelayModernProblem(errors)
        || <GenericUnknownErrorMessage />
      ), 'error');
    };

    commitMutation(Relay.Store, {
      mutation: graphql`
        mutation TeamMembersComponentEditRoleMutation($input: UpdateTeamUserInput!) {
          updateTeamUser(input: $input) {
            team_user {
              id
              role
            }
          }
        }
      `,
      variables: {
        input: {
          id,
          role,
        },
      },
      onError: onFailure,
    });
  };

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
                    <RoleSelect
                      value={tu.node.role}
                      onChange={e => handleChangeRole(tu.node.id, e.target.value)}
                    />
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

export default withSetFlashMessage(TeamMembersComponent);
