import React from 'react';
import Relay from 'react-relay/classic';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import TextField from '../cds/inputs/TextField';
import { can } from '../Can';
import { withSetFlashMessage } from '../FlashMessage';
import { getErrorMessage } from '../../helpers';
import { ContentColumn, avatarSizeLarge } from '../../styles/js/shared';
import { StyledAvatarEditButton } from '../../styles/js/HeaderCard';
import CreateTeamDialog from './CreateTeamDialog';
import SettingsHeader from './SettingsHeader';
import TeamAvatar from './TeamAvatar';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import SwitchComponent from '../cds/inputs/SwitchComponent';
import Alert from '../cds/alerts-and-prompts/Alert';
import UploadFile from '../UploadFile';
import UpdateTeamMutation from '../../relay/mutations/UpdateTeamMutation';
import styles from './TeamDetails.module.css';

const TeamDetails = ({
  setFlashMessage,
  team,
}) => {
  const [showDuplicateTeamDialog, setShowDuplicateTeamDialog] = React.useState(false);
  const [avatar, setAvatar] = React.useState(null);
  const [name, setName] = React.useState(team.name);
  const [editProfileImg, setEditProfileImg] = React.useState(false);
  const [shortenOutgoingUrls, setShortenOutgoingUrls] = React.useState(team.get_shorten_outgoing_urls);
  const [utmCode, setUtmCode] = React.useState(team.get_outgoing_urls_utm_code);
  const [isSaving, setIsSaving] = React.useState(false);

  const canEditTeam = can(team.permissions, 'update Team');
  const hasRssNewsletters = Boolean(team.tipline_newsletters.edges.find(tn => tn.node.content_type === 'rss'));
  const hasScheduledNewsletters = Boolean(team.tipline_newsletters.edges.find(tn => tn.node.enabled));

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
          defaultMessage="Workspace details saved successfully"
          description="Success message displayed when workspace settings are saved"
        />
      ), 'success');
    };

    if (!isSaving) {
      Relay.Store.commitUpdate(
        new UpdateTeamMutation({
          id: team.id,
          public_id: team.public_team_id,
          shorten_outgoing_urls: shortenOutgoingUrls,
          outgoing_urls_utm_code: utmCode,
          avatar,
          name,
        }),
        { onSuccess, onFailure },
      );
      setIsSaving(true);
    }
  };

  return (
    <ContentColumn large>
      <SettingsHeader
        title={
          <FormattedMessage
            id="teamDetails.title"
            defaultMessage="Workspace"
            description="Title for details page of current workspace"
          />
        }
        subtitle={
          <FormattedMessage
            id="teamDetails.subtitle"
            defaultMessage="Add details to your Check workspace."
            description="Subtitle for details page of current workspace"
          />
        }
        actionButton={
          <div className={styles['team-details-buttons']}>
            <Button
              id="team-details__duplicate-button"
              disabled={!can(team.permissions, 'duplicate Team')}
              variant="outlined"
              onClick={() => setShowDuplicateTeamDialog(true)}
            >
              <FormattedMessage
                id="teamDetails.duplicateWorkspace"
                defaultMessage="Duplicate workspace"
                description="Label of a button to duplicate a workspace"
              />
            </Button>
            <Button
              id="team-details__update-button"
              color="primary"
              variant="contained"
              onClick={handleSave}
              disabled={!canEditTeam || isSaving}
            >
              <FormattedMessage
                id="teamDetails.update"
                defaultMessage="Update"
                description="Label of the button that saves workspace details"
              />
            </Button>
          </div>
        }
      />
      <div className={styles['team-details']}>
        <div className={styles['team-details-avatar']}>
          <TeamAvatar
            team={avatar && avatar.preview ? { avatar: avatar.preview } : { avatar: team.avatar }}
            size={avatarSizeLarge}
          />
          { !editProfileImg ?
            <StyledAvatarEditButton>
              <Button
                id="team-details__edit-avatar-button"
                color="primary"
                onClick={() => setEditProfileImg(true)}
                disabled={!canEditTeam}
              >
                <FormattedMessage id="teamDetails.edit" defaultMessage="Edit" description="Label for a button to change a workspace image" />
              </Button>
            </StyledAvatarEditButton>
            : null
          }
        </div>

        <div className={styles['team-details-column']}>
          <div className={styles['team-details-section']}>
            <div className="typography-subtitle2">
              <FormattedMessage id="teamDetails.profile" defaultMessage="Profile" description="Title of the profile section in team details page" />
            </div>
            { editProfileImg ?
              <UploadFile
                type="image"
                value={avatar}
                onChange={handleImageChange}
                onError={handleImageError}
                noPreview
              />
              : null
            }
            <TextField
              id="team-details__name-input"
              defaultValue={team.name}
              disabled={!canEditTeam}
              fullWidth
              label={
                <FormattedMessage
                  id="teamDetails.workspaceName"
                  defaultMessage="Workspace name"
                  description="Label for workspace name field"
                />
              }
              margin="normal"
              onChange={e => setName(e.target.value)}
              variant="outlined"
              required
            />
          </div>

          <div className={styles['team-details-section']}>
            <div className="typography-subtitle2">
              <FormattedMessage id="teamDetails.linkManagement" defaultMessage="Link management" description="Title of the link management section in team details page" />
            </div>
            <SwitchComponent
              label={<FormattedMessage
                id="teamDetails.linkManagementSwitcher"
                defaultMessage="Enable link shortening and analytics"
                description="Label for a switch where the user toggles link management in team details page"
              />}
              checked={shortenOutgoingUrls || hasRssNewsletters}
              disabled={hasRssNewsletters || hasScheduledNewsletters}
              helperContent={
                hasRssNewsletters ?
                  <FormattedMessage id="teamDetails.linkManagementRss" defaultMessage="The link service cannot be disabled while RSS newsletters are configured in this workspace" description="Helper text for link management switcher when workspace has RSS newsletters configured" /> :
                  null
              }
              onChange={setShortenOutgoingUrls}
            />
            { shortenOutgoingUrls ?
              <TextField
                id="team-details__utm-code"
                defaultValue={utmCode}
                fullWidth
                label={
                  <FormattedMessage
                    id="teamDetails.utmCode"
                    defaultMessage="UTM code"
                    description="Label for 'UTM code' field"
                  />
                }
                margin="normal"
                onChange={e => setUtmCode(e.target.value)}
                helperText={<FormattedMessage id="teamDetails.utmCodeHelp" defaultMessage="Customize the UTM code appended to links. Leave blank to disable UTM codes." description="Helper text for UTM code field" />}
                variant="outlined"
                disabled={hasScheduledNewsletters}
              /> : null
            }
            { shortenOutgoingUrls ?
              <Alert
                type="warning"
                title={<FormattedMessage id="teamDetails.warnTitle" defaultMessage="All links sent via Check are managed" description="Text displayed in a warning box on team details page when link shortening is on" />}
                content={<FormattedMessage id="teamDetails.warnContent" defaultMessage="Links processed in the Check platform will be rewritten to match this example: https://chck.media/x1y2z3w4. The unique code in each link will redirect your users to the original final destination." description="Text displayed in a warning box on team details page when link shortening is on" />}
              /> : null
            }
          </div>
        </div>
      </div>
      <Box mt={2}>
        { showDuplicateTeamDialog ?
          <CreateTeamDialog onDismiss={() => setShowDuplicateTeamDialog(false)} team={team} /> :
          null
        }
      </Box>
    </ContentColumn>
  );
};

export default createFragmentContainer(withSetFlashMessage(TeamDetails), graphql`
  fragment TeamDetails_team on Team {
    id
    public_team_id
    name
    avatar
    permissions
    get_shorten_outgoing_urls
    get_outgoing_urls_utm_code
    tipline_newsletters(first: 10000) {
      edges {
        node {
          content_type
          enabled
        }
      }
    }
    ...CreateTeamDialog_team
  }
`);
