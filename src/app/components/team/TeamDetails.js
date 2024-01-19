import React from 'react';
import Relay from 'react-relay/classic';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import cx from 'classnames/bind';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import TextField from '../cds/inputs/TextField';
import { can } from '../Can';
import { withSetFlashMessage } from '../FlashMessage';
import { getErrorMessage } from '../../helpers';
import CreateTeamDialog from './CreateTeamDialog';
import SettingsHeader from './SettingsHeader';
import TeamAvatar from './TeamAvatar';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import SwitchComponent from '../cds/inputs/SwitchComponent';
import Alert from '../cds/alerts-and-prompts/Alert';
import UploadFile from '../UploadFile';
import UpdateTeamMutation from '../../relay/mutations/UpdateTeamMutation';
import inputStyles from '../../styles/css/inputs.module.css';
import settingsStyles from './Settings.module.css';
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
    <>
      <SettingsHeader
        title={
          <FormattedMessage
            id="teamDetails.title"
            defaultMessage="Workspace"
            description="Title for details page of current workspace"
          />
        }
        actionButton={
          <>
            <ButtonMain
              buttonProps={{
                id: 'team-details__duplicate-button',
              }}
              disabled={!can(team.permissions, 'duplicate Team')}
              variant="outlined"
              theme="text"
              size="default"
              onClick={() => setShowDuplicateTeamDialog(true)}
              label={
                <FormattedMessage
                  id="teamDetails.duplicateWorkspace"
                  defaultMessage="Duplicate workspace"
                  description="Label of a button to duplicate a workspace"
                />
              }
            />
            <ButtonMain
              buttonProps={{
                id: 'team-details__update-button',
              }}
              theme="brand"
              size="default"
              variant="contained"
              onClick={handleSave}
              disabled={!canEditTeam || isSaving}
              label={
                <FormattedMessage
                  id="teamDetails.update"
                  defaultMessage="Update"
                  description="Label of the button that saves workspace details"
                />
              }
            />
          </>
        }
      />
      <div className={cx(settingsStyles['setting-details-wrapper'], styles['team-details'])}>
        <div className={styles['team-details-avatar']}>
          <TeamAvatar
            team={avatar && avatar.preview ? { avatar: avatar.preview } : { avatar: team.avatar }}
            size="72px"
          />
          { !editProfileImg ?
            <ButtonMain
              buttonProps={{
                id: 'team-details__edit-avatar-button',
              }}
              theme="brand"
              variant="text"
              size="default"
              onClick={() => setEditProfileImg(true)}
              disabled={!canEditTeam}
              label={
                <FormattedMessage id="teamDetails.edit" defaultMessage="Edit" description="Label for a button to change a workspace image" />
              }
              className={styles.StyledAvatarEditButton}
            />
            : null
          }
        </div>

        <div className={styles['team-details-column']}>
          <div className={settingsStyles['setting-content-container']}>
            <div className={settingsStyles['setting-content-container-title']}>
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
              label={
                <FormattedMessage
                  id="teamDetails.workspaceName"
                  defaultMessage="Workspace name"
                  description="Label for workspace name field"
                />
              }
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div className={settingsStyles['setting-content-container']}>
            <div className={settingsStyles['setting-content-container-title']}>
              <FormattedMessage id="teamDetails.linkManagement" defaultMessage="Link management" description="Title of the link management section in team details page" />
            </div>
            <div className={inputStyles['form-fieldset']}>
              <SwitchComponent
                className={inputStyles['form-fieldset-field']}
                label={<FormattedMessage
                  id="teamDetails.linkManagementSwitcher"
                  defaultMessage="Enable link shortening and analytics"
                  description="Label for a switch where the user toggles link management in team details page"
                />}
                checked={shortenOutgoingUrls || hasRssNewsletters}
                disabled={hasRssNewsletters || hasScheduledNewsletters}
                helperContent={
                  <FormattedHTMLMessage
                    id="teamDetails.linkManagementRss"
                    defaultMessage='Link shortening makes URLs more readable and a predictable length. If you’re using an RSS feed, the link service cannot be disabled. <a href="{helpLink}" target="_blank" title="Learn more">Learn more about link shortening</a>.'
                    description="Helper text for link management switcher when workspace has RSS newsletters configured"
                    values={{ helpLink: 'https://help.checkmedia.org/en/articles/5540430-tipline-newsletters' }}
                  />
                }
                onChange={setShortenOutgoingUrls}
              />
              { shortenOutgoingUrls ?
                <>
                  <TextField
                    className={inputStyles['form-fieldset-field']}
                    id="team-details__utm-code"
                    defaultValue={utmCode}
                    fullWidth
                    label={
                      <FormattedMessage
                        id="teamDetails.utmCode"
                        defaultMessage="UTM code (optional)"
                        description="Label for 'UTM code' field"
                      />
                    }
                    margin="normal"
                    onChange={e => setUtmCode(e.target.value)}
                    helpContent={
                      <FormattedHTMLMessage
                        id="teamDetails.utmCodeHelp"
                        defaultMessage='Customize the UTM code appended to the links. Leave blank to disable UTM codes. Use UTM codes to track article analytics. <a href="{helpLink}" target="_blank" title="Learn more">Learn more about UTM codes</a>.'
                        values={{ helpLink: 'https://help.checkmedia.org/en/articles/5540430-tipline-newsletters' }}
                        description="Helper text for UTM code field"
                      />
                    }
                    variant="outlined"
                    disabled={hasScheduledNewsletters}
                  />
                  <Alert
                    className={inputStyles['form-fieldset-field']}
                    variant="warning"
                    contained
                    title={<FormattedMessage id="teamDetails.warnTitle" defaultMessage="All links sent via Check will be rewritten." description="Text displayed in the title of a warning box on team details page when link shortening is on" />}
                    content={
                      <FormattedHTMLMessage
                        id="teamDetails.warnContent"
                        defaultMessage="<strong>BEFORE:</strong> https://www.example.com/your-link<br /><strong>AFTER:</strong> https://chck.media/x1y2z3w4/{code}"
                        values={{ code: utmCode ? `?utm_source=${utmCode}` : '' }}
                        description="Text displayed in the content of a warning box on team details page when link shortening is on"
                      />
                    }
                  />
                </>
                : null
              }
            </div>
          </div>
        </div>

        { showDuplicateTeamDialog &&
          <CreateTeamDialog onDismiss={() => setShowDuplicateTeamDialog(false)} team={team} />
        }
      </div>
    </>
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
