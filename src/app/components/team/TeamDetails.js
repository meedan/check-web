import React from 'react';
import Relay from 'react-relay/classic';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import cx from 'classnames/bind';
import CreateTeamDialog from './CreateTeamDialog';
import SettingsHeader from './SettingsHeader';
import TeamAvatar from './TeamAvatar';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import TextField from '../cds/inputs/TextField';
import { can } from '../Can';
import { withSetFlashMessage } from '../FlashMessage';
import { getErrorMessage } from '../../helpers';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import SwitchComponent from '../cds/inputs/SwitchComponent';
import Alert from '../cds/alerts-and-prompts/Alert';
import UploadFile from '../UploadFile';
import UpdateTeamMutation from '../../relay/mutations/UpdateTeamMutation';
import inputStyles from '../../styles/css/inputs.module.css';
import styles from './TeamDetails.module.css';
import settingsStyles from './Settings.module.css';

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
          defaultMessage="Workspace details saved successfully"
          description="Success message displayed when workspace settings are saved"
          id="teamDetails.savedSuccessfully"
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
        actionButton={
          <>
            <ButtonMain
              buttonProps={{
                id: 'team-details__duplicate-button',
              }}
              disabled={!can(team.permissions, 'duplicate Team')}
              label={
                <FormattedMessage
                  defaultMessage="Duplicate workspace"
                  description="Label of a button to duplicate a workspace"
                  id="teamDetails.duplicateWorkspace"
                />
              }
              size="default"
              theme="text"
              variant="outlined"
              onClick={() => setShowDuplicateTeamDialog(true)}
            />
            <ButtonMain
              buttonProps={{
                id: 'team-details__update-button',
              }}
              disabled={!canEditTeam || isSaving}
              label={
                <FormattedMessage
                  defaultMessage="Update"
                  description="Label of the button that saves workspace details"
                  id="teamDetails.update"
                />
              }
              size="default"
              theme="info"
              variant="contained"
              onClick={handleSave}
            />
          </>
        }
        title={
          <FormattedMessage
            defaultMessage="Workspace"
            description="Title for details page of current workspace"
            id="teamDetails.title"
          />
        }
      />
      <div className={cx(settingsStyles['setting-details-wrapper'], styles['team-details'])}>
        <div className={styles['team-details-avatar']}>
          <TeamAvatar
            size="72px"
            team={avatar && avatar.preview ? { avatar: avatar.preview } : { avatar: team.avatar }}
          />
          { !editProfileImg ?
            <ButtonMain
              buttonProps={{
                id: 'team-details__edit-avatar-button',
              }}
              className={styles.StyledAvatarEditButton}
              disabled={!canEditTeam}
              label={
                <FormattedMessage defaultMessage="Edit" description="Label for a button to change a workspace image" id="teamDetails.edit" />
              }
              size="default"
              theme="info"
              variant="text"
              onClick={() => setEditProfileImg(true)}
            />
            : null
          }
        </div>

        <div className={styles['team-details-column']}>
          <div className={settingsStyles['setting-content-container']}>
            { editProfileImg ?
              <UploadFile
                noPreview
                type="image"
                value={avatar}
                onChange={handleImageChange}
                onError={handleImageError}
              />
              : null
            }
            <TextField
              defaultValue={team.name}
              disabled={!canEditTeam}
              id="team-details__name-input"
              label={
                <FormattedMessage
                  defaultMessage="Workspace name"
                  description="Label for workspace name field"
                  id="teamDetails.workspaceName"
                />
              }
              required
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className={settingsStyles['setting-content-container']}>
            <div className={settingsStyles['setting-content-container-title']}>
              <FormattedMessage defaultMessage="Link Management" description="Title of the link management section in team details page" id="teamDetails.linkManagement" />
            </div>
            <div className={inputStyles['form-fieldset']}>
              <SwitchComponent
                checked={shortenOutgoingUrls || hasRssNewsletters}
                className={inputStyles['form-fieldset-field']}
                disabled={hasRssNewsletters || hasScheduledNewsletters}
                helperContent={
                  <>
                    <FormattedHTMLMessage
                      defaultMessage="<strong>Link engagement analytics:</strong> Link shortening is used to record the number of times the link was clicked by users when distributed through a report or a newsletter."
                      description="Helper text for link management switcher when workspace has RSS newsletters configured"
                      id="teamDetails.linkManagementRss"
                      tagName="div"
                    />
                    <br />
                    <FormattedHTMLMessage
                      defaultMessage='<strong>Link length and RSS:</strong> Link shortening makes URLs a predictable length. If you are using an RSS feed, the link service cannot be disabled. <a href="{helpLink}" target="_blank" title="Learn more">Learn more about link shortening</a>.'
                      description="Additional helper text for link management describing link length"
                      id="teamDetails.linkManagementLinkLength"
                      tagName="div"
                      values={{ helpLink: 'https://help.checkmedia.org/en/articles/8772933-manage-links#h_99c0776acf' }}
                    />
                  </>
                }
                label={<FormattedMessage
                  defaultMessage="Enable link shortening and engagement analytics"
                  description="Label for a switch where the user toggles link management in team details page"
                  id="teamDetails.linkManagementSwitcher"
                />}
                onChange={setShortenOutgoingUrls}
              />
              { shortenOutgoingUrls ?
                <div className={styles['link-engagement-details']}>
                  <div className={settingsStyles['setting-content-container-inner']}>
                    <FormattedMessage
                      defaultMessage="Leave blank to disable UTM codes."
                      description="Placeholder for the optional UTM code text field"
                      id="teamDetails.utmCodePlaceholder"
                    >
                      { placeholder => (
                        <TextField
                          className={inputStyles['form-fieldset-field']}
                          defaultValue={utmCode}
                          disabled={hasScheduledNewsletters}
                          helpContent={
                            <FormattedHTMLMessage
                              defaultMessage='Customize the UTM code appended to the links. Leave blank to disable UTM codes. Use UTM codes to track article analytics. <a href="{helpLink}" target="_blank" title="Learn more">Learn more about UTM codes</a>.'
                              description="Helper text for UTM code field"
                              id="teamDetails.utmCodeHelp"
                              values={{ helpLink: 'https://help.checkmedia.org/en/articles/8772933-manage-links#h_9bfd0e654f' }}
                            />
                          }
                          id="team-details__utm-code"
                          label={
                            <FormattedMessage
                              defaultMessage="UTM code (optional)"
                              description="Label for 'UTM code' field"
                              id="teamDetails.utmCode"
                            />
                          }
                          placeholder={placeholder}
                          onChange={e => setUtmCode(e.target.value)}
                        />
                      )}
                    </FormattedMessage>
                    <Alert
                      className={inputStyles['form-fieldset-field']}
                      contained
                      content={
                        <FormattedHTMLMessage
                          defaultMessage="<strong>Before:</strong> https://www.example.com/your-link<br /><strong>After:</strong> https://chck.media/x1y2z3w4/{code}"
                          description="Text displayed in the content of a warning box on team details page when link shortening is on"
                          id="teamDetails.warnContent"
                          values={{ code: utmCode ? `?utm_source=${utmCode}` : '' }}
                        />
                      }
                      title={<FormattedMessage defaultMessage="All links sent via Check will be rewritten." description="Text displayed in the title of a warning box on team details page when link shortening is on" id="teamDetails.warnTitle" />}
                      variant="warning"
                    />
                  </div>
                </div>
                : null
              }
            </div>
          </div>
        </div>

        { showDuplicateTeamDialog &&
          <CreateTeamDialog team={team} onDismiss={() => setShowDuplicateTeamDialog(false)} />
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
