import React from 'react';
import Relay from 'react-relay/classic';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import TextField from '@material-ui/core/TextField';
import CreateTeamDialog from './CreateTeamDialog';
import SettingsHeader from './SettingsHeader';
import TeamAvatar from './TeamAvatar';
import Can from '../Can';
import { withSetFlashMessage } from '../FlashMessage';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import UploadFile from '../UploadFile';
import globalStrings from '../../globalStrings';
import { getErrorMessage } from '../../helpers';
import { ContentColumn, avatarSizeLarge } from '../../styles/js/shared';
import {
  StyledTwoColumns,
  StyledBigColumn,
  StyledSmallColumn,
  StyledAvatarEditButton,
} from '../../styles/js/HeaderCard';
import UpdateTeamMutation from '../../relay/mutations/UpdateTeamMutation';

const TeamDetails = ({
  setFlashMessage,
  team,
}) => {
  const [showDuplicateTeamDialog, setShowDuplicateTeamDialog] = React.useState(false);
  const [avatar, setAvatar] = React.useState(null);
  const [name, setName] = React.useState(team.name);
  const [description, setDescription] = React.useState(team.description);
  const [editProfileImg, setEditProfileImg] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const handleImageChange = (file) => {
    setAvatar(file);
  };

  const handleImageError = (file, message) => {
    setAvatar(null);
    setFlashMessage(message, 'error');
  };

  const handleSave = () => {
    const onFailure = (transaction) => {
      const message = getErrorMessage(transaction, <GenericUnknownErrorMessage />);
      setFlashMessage(message, 'error');
    };

    const onSuccess = () => {
      setAvatar(null);
      setIsSaving(false);
      setEditProfileImg(false);
      setFlashMessage((
        <FormattedMessage
          id="teamDetails.savedSuccessfully"
          defaultMessage="Workspace details saved sucessfully"
        />
      ), 'success');
    };

    if (!isSaving) {
      Relay.Store.commitUpdate(
        new UpdateTeamMutation({
          id: team.id,
          public_id: team.public_team_id,
          avatar,
          name,
          description,
        }),
        { onSuccess, onFailure },
      );
      setIsSaving(true);
    }
  };

  return (
    <ContentColumn>
      <SettingsHeader
        title={
          <FormattedMessage
            id="teamDetails.title"
            defaultMessage="Workspace details"
            description="Title for workspace details page"
          />
        }
        subtitle={
          <FormattedMessage
            id="teamDetails.subtitle"
            defaultMessage="Add details to your Check workspace"
          />
        }
        actionButton={
          <Button
            className="team-details__update-button"
            color="primary"
            variant="contained"
            onClick={handleSave}
            disabled={isSaving}
          >
            <FormattedMessage
              id="teamDetails.update"
              defaultMessage="Update"
            />
          </Button>
        }
      />
      <Card>
        <CardContent>
          <StyledTwoColumns>
            <StyledSmallColumn>
              <TeamAvatar
                team={avatar && avatar.preview ? { avatar: avatar.preview } : team}
                size={avatarSizeLarge}
              />
              { !editProfileImg ?
                <StyledAvatarEditButton className="team__edit-avatar-button">
                  <Button
                    color="primary"
                    onClick={() => setEditProfileImg(true)}
                  >
                    <FormattedMessage {...globalStrings.edit} />
                  </Button>
                </StyledAvatarEditButton>
                : null }
            </StyledSmallColumn>
            <StyledBigColumn>
              { editProfileImg ?
                <UploadFile
                  type="image"
                  value={avatar}
                  onChange={handleImageChange}
                  onError={handleImageError}
                  noPreview
                />
                : null }
              <div>
                <TextField
                  defaultValue={team.name}
                  fullWidth
                  label={
                    <FormattedMessage
                      id="teamDetails.workspaceName"
                      defaultMessage="Workspace name"
                    />
                  }
                  margin="normal"
                  onChange={e => setName(e.target.value)}
                  variant="outlined"
                />
              </div>
              <div>
                <TextField
                  defaultValue={team.description}
                  fullWidth
                  label={
                    <FormattedMessage
                      id="teamDetails.description"
                      defaultMessage="Description"
                    />
                  }
                  margin="normal"
                  multiline
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  variant="outlined"
                />
              </div>
            </StyledBigColumn>
          </StyledTwoColumns>
        </CardContent>
      </Card>
      <Box mt={2}>
        <Can permissions={team.permissions} permission="duplicate Team">
          <Button
            id="team-details__duplicate-button"
            color="primary"
            variant="contained"
            onClick={() => setShowDuplicateTeamDialog(true)}
          >
            <FormattedMessage
              id="teamDetails.duplicateWorkspace"
              defaultMessage="Duplicate workspace"
            />
          </Button>
          { showDuplicateTeamDialog ?
            <CreateTeamDialog onDismiss={() => setShowDuplicateTeamDialog(false)} team={team} /> :
            null
          }
        </Can>
      </Box>
    </ContentColumn>
  );
};

export default createFragmentContainer(withSetFlashMessage(TeamDetails), graphql`
  fragment TeamDetails_team on Team {
    id
    public_team_id
    name
    description
    avatar
  }
`);
