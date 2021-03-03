import React from 'react';
import Relay from 'react-relay/classic';
import { commitMutation, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import IconMoreVert from '@material-ui/icons/MoreVert';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import CopyToClipboard from 'react-copy-to-clipboard';
import { withSetFlashMessage } from '../FlashMessage';

const TeamMemberActions = ({
  setFlashMessage,
  teamUser,
  team,
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleRemoveUser = (id) => {
    setAnchorEl(null);
    const onFailure = () => {
      // FIXME Fix copy
      setFlashMessage('Faiô!', 'error');
    };

    commitMutation(Relay.Store, {
      mutation: graphql`
        mutation TeamMemberActionsRemoveUserMutation($input: DestroyTeamUserInput!) {
          destroyTeamUser(input: $input) {
            deletedId
            team {
              team_users(first: 10000, status: ["invited", "member", "banned"]) {
                edges {
                  node {
                    id
                    status
                    role
                  }
                }
              }
            }
          }
        }
      `,
      variables: {
        input: {
          id,
        },
      },
      configs: [{
        type: 'RANGE_DELETE',
        parentID: team.id,
        connectionKeys: ['Team_teamUsers'],
        pathToConnection: ['team', 'team_users'],
        deletedIDFieldName: 'deletedId',
      }],
      onError: onFailure,
    });
  };

  const handleCopyToClipboard = () => {
    setAnchorEl(null);
    setFlashMessage((
      <FormattedMessage
        id="teamMemberActions.copiedToClipboard"
        defaultMessage="The email has been copied to the clipboard"
      />
    ), 'success');
  };

  return (
    <React.Fragment>
      <IconButton
        tooltip={<FormattedMessage id="teamMembers.tooltip" defaultMessage="Manage member" />}
        onClick={e => setAnchorEl(e.currentTarget)}
      >
        <IconMoreVert className="team-members__icon-menu" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        { teamUser.user.email ? (
          <CopyToClipboard text={teamUser.user.email} onCopy={handleCopyToClipboard}>
            <MenuItem>
              <FormattedMessage
                id="teamMembers.copyEmail"
                defaultMessage="Copy email"
              />
            </MenuItem>
          </CopyToClipboard>
        ) : null }
        <MenuItem onClick={() => handleRemoveUser(teamUser.id)}>
          <FormattedMessage
            id="teamMembers.remove"
            defaultMessage="Remove"
          />
        </MenuItem>
        { teamUser.status === 'invited' ? (
          <MenuItem>
            <FormattedMessage
              id="teamMembers.resendInvite"
              defaultMessage="Resend invite"
            />
          </MenuItem>
        ) : null }
      </Menu>
    </React.Fragment>
  );
};

export default withSetFlashMessage(TeamMemberActions);
