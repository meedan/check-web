/* eslint-disable relay/unused-fields, react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { createFragmentContainer, commitMutation, graphql } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import Box from '@material-ui/core/Box';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import cx from 'classnames/bind';
import ThresholdControl from './ThresholdControl';
import TextField from '../../cds/inputs/TextField';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import SwitchComponent from '../../cds/inputs/SwitchComponent';
import SettingsHeader from '../SettingsHeader';
import Can from '../../Can';
import { withSetFlashMessage } from '../../FlashMessage';
import GenericUnknownErrorMessage from '../../GenericUnknownErrorMessage';
import { getErrorObjectsForRelayModernProblem } from '../../../helpers';
import CheckError from '../../../CheckError';
import settingsStyles from '../Settings.module.css';

const MEAN_TOKENS_MODEL = 'xlm-r-bert-base-nli-stsb-mean-tokens';
const INDIAN_MODEL = 'indian-sbert';
const ELASTICSEARCH_MODEL = 'elasticsearch';
const FILIPINO_MODEL = 'paraphrase-filipino-mpnet-base-v2';
const OPENAI_ADA_MODEL = 'openai-text-embedding-ada-002';
const PARAPHRASE_MULTILINGUAL_MODEL = 'paraphrase-multilingual-mpnet-base-v2';

const SimilarityComponent = ({
  setFlashMessage,
  team,
  user,
}) => {
  const isSuperAdmin = user.is_admin;
  const { alegre_settings } = team.alegre_bot;

  const [settings, setSettings] = React.useState(alegre_settings);
  const [vectorModelToggle, setVectorModelToggle] = React.useState(() => {
    const textSimilarityModel = alegre_settings.text_similarity_model;
    if (typeof textSimilarityModel === 'string') {
      return (
        textSimilarityModel === MEAN_TOKENS_MODEL ||
        textSimilarityModel === INDIAN_MODEL ||
        textSimilarityModel === FILIPINO_MODEL ||
        textSimilarityModel === OPENAI_ADA_MODEL ||
        textSimilarityModel === PARAPHRASE_MULTILINGUAL_MODEL
      );
    }
    return (
      textSimilarityModel.includes(MEAN_TOKENS_MODEL) ||
      textSimilarityModel.includes(INDIAN_MODEL) ||
      textSimilarityModel.includes(FILIPINO_MODEL) ||
      textSimilarityModel.includes(OPENAI_ADA_MODEL) ||
      textSimilarityModel.includes(PARAPHRASE_MULTILINGUAL_MODEL)
    );
  });

  const handleSettingsChange = (key, value) => {
    const newSettings = { ...settings };
    newSettings[key] = value;
    setSettings(newSettings);
  };

  const handleModelSettingsChange = (model) => {
    const newSettings = { ...settings };
    const updatedModels = Array.isArray(settings.alegre_model_in_use) ? [...settings.alegre_model_in_use] : [settings.alegre_model_in_use];

    if (updatedModels.includes(model)) {
      // If the model is currently in use, remove it (uncheck it)
      const index = updatedModels.indexOf(model);
      updatedModels.splice(index, 1);
    } else {
      updatedModels.push(model);
    }

    newSettings.alegre_model_in_use = updatedModels;
    newSettings.text_similarity_model = updatedModels;
    setSettings(newSettings);
  };

  const handleThresholdChange = (key, newValue) => {
    handleSettingsChange(key, newValue / 100);
  };

  const handleVectorModelToggle = (useVectorModel) => {
    if (!useVectorModel) {
      const newSettings = { ...settings };
      newSettings.alegre_model_in_use = ELASTICSEARCH_MODEL;
      newSettings.text_similarity_model = ELASTICSEARCH_MODEL;
      setSettings(newSettings);
    } else {
      handleModelSettingsChange(MEAN_TOKENS_MODEL);
    }
    setVectorModelToggle(useVectorModel);
  };

  const [saving, setSaving] = React.useState(false);

  const handleError = (error) => {
    setSaving(false);
    const errors = getErrorObjectsForRelayModernProblem(error);
    const message = errors && errors.length > 0 ? CheckError.getMessageFromCode(errors[0].code) : <GenericUnknownErrorMessage />;
    setFlashMessage(message, 'error');
  };

  const handleSuccess = () => {
    setSaving(false);
    setFlashMessage((
      <FormattedMessage
        defaultMessage="Similarity settings saved successfully"
        description="Banner displayed when similarity settings are saved successfully"
        id="similarityComponent.savedSuccessfully"
      />
    ), 'success');
  };

  const handleSave = () => {
    setSaving(true);

    const mutation = graphql`
      mutation SimilarityComponentUpdateTeamBotInstallationMutation($input: UpdateTeamBotInstallationInput!) {
        updateTeamBotInstallation(input: $input) {
          team_bot_installation {
            id
            json_settings
            lock_version
            team {
              id
              alegre_bot: team_bot_installation(bot_identifier: "alegre") {
                id
                alegre_settings
                lock_version
              }
            }
          }
        }
      }
    `;

    commitMutation(Store, {
      mutation,
      variables: {
        input: {
          id: team.alegre_bot.id,
          json_settings: JSON.stringify(settings),
          lock_version: team.alegre_bot.lock_version,
        },
      },
      onCompleted: handleSuccess,
      onError: handleError,
    });
  };

  const hasError =
    (settings.text_elasticsearch_suggestion_threshold > settings.text_elasticsearch_matching_threshold) ||
    (settings.text_vector_suggestion_threshold > settings.text_vector_matching_threshold) ||
    (settings.image_hash_suggestion_threshold > settings.image_hash_matching_threshold) ||
    (settings.video_hash_suggestion_threshold > settings.video_hash_matching_threshold) ||
    (settings.audio_hash_suggestion_threshold > settings.audio_hash_matching_threshold);

  return (
    <React.Fragment>
      <SettingsHeader
        actionButton={
          team.alegre_bot ?
            <Can permission="update Team" permissions={team.permissions}>
              <ButtonMain
                buttonProps={{
                  id: 'similarity-component__save',
                }}
                disabled={saving || hasError}
                label={
                  <FormattedMessage defaultMessage="Save" description="Label for Save Button on Similarity settings page" id="similarityComponent.save" />
                }
                size="default"
                theme="info"
                variant="contained"
                onClick={handleSave}
              />
            </Can> : null
        }
        context={
          <FormattedHTMLMessage
            defaultMessage='Manage settings for automatic matching of similar media. <a href="{helpLink}" target="_blank" title="Learn more">Learn more about automatic matching</a>.'
            description="Context description for the functionality of this page"
            id="similarityComponent.helpContext"
            values={{ helpLink: 'https://help.checkmedia.org/en/articles/8720702-similarity-matching#h_1a3e308d49' }}
          />
        }
        title={
          <FormattedMessage
            defaultMessage="Similarity Matching"
            description="Title to similarity matching settings page"
            id="similarityComponent.title"
          />
        }
      />
      <div className={cx(settingsStyles['setting-details-wrapper'])}>
        <div className={settingsStyles['setting-content-container']}>
          <SwitchComponent
            checked={settings.master_similarity_enabled}
            label={
              settings.master_similarity_enabled ?
                <FormattedMessage defaultMessage="Automated matching is ON" description="Switch input label when switch is set to automatic matching" id="similarityComponent.masterSwitchLabelOn" /> :
                <FormattedMessage defaultMessage="Automated matching is OFF" description="Switch input label when switch is set to not automatic match" id="similarityComponent.masterSwitchLabelOff" />
            }
            labelPlacement="end"
            onChange={() => handleSettingsChange('master_similarity_enabled', !settings.master_similarity_enabled)}
          />
          <Box color={settings.master_similarity_enabled ? '' : 'gray'} mb={2} ml={7}>
            <Box alignItems="center" display="flex">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={settings.date_similarity_threshold_enabled}
                    disabled={!settings.master_similarity_enabled}
                    onChange={() => handleSettingsChange('date_similarity_threshold_enabled', !settings.date_similarity_threshold_enabled)}
                  />
                }
                label={
                  <FormattedMessage
                    defaultMessage="Limit matching to recently submitted content"
                    description="Allow user to enable/disable similarity matching based on submitted date"
                    id="similarityComponent.dateThresholdSettings"
                  />
                }
              />
            </Box>
            <Box ml={4} mt={1}>
              <FormattedMessage
                defaultMessage="Similar content last submitted more than {maxTime} months ago will only be suggested"
                description="Number input for how many month back similarity suggestions will be processed for"
                id="similarityComponent.dateThreshold"
                values={{
                  maxTime: (
                    <TextField
                      className={settingsStyles['similarity-component-input']}
                      disabled={!settings.date_similarity_threshold_enabled} // eslint-disable-line react/jsx-no-duplicate-props
                      inputProps={{ min: 0 }}
                      type="number"
                      value={settings.similarity_date_threshold}
                      variant="outlined"
                      onChange={(e) => { handleSettingsChange('similarity_date_threshold', e.target.value); }}
                    />
                  ),
                }}
              />
            </Box>
          </Box>
          <Box mt={1}>
            <SwitchComponent
              checked={settings.single_language_fact_checks_enabled}
              helperContent={
                <FormattedHTMLMessage
                  defaultMessage='If enabled, articles will only be sent to users whose chosen language of conversation in the tipline matches the article language. If disabled, articles will be sent to all users whose media matches the claim, regardless of their conversation language. <a href="{helpLink}" target="_blank" title="Learn more">Learn more about tipline menus</a>.'
                  description="Help text displayed when similarity setting for single language articles is enabled"
                  id="similarityComponent.singleLanguageFactChecksHelp"
                  values={{ helpLink: 'https://help.checkmedia.org/en/articles/8772787-design-your-tipline' }}
                />
              }
              label={
                <FormattedMessage
                  defaultMessage="Only send articles in the same language as the conversation language"
                  description="Label displayed when similarity setting for single language articles is enabled"
                  id="similarityComponent.singleLanguageFactChecksEnabled"
                />
              }
              labelPlacement="end"
              onChange={() => handleSettingsChange('single_language_fact_checks_enabled', !settings.single_language_fact_checks_enabled)}
            />
          </Box>
        </div>
        { settings.master_similarity_enabled && isSuperAdmin ? (
          <React.Fragment>
            <br />
            <h6>
              Internal settings
            </h6>
            <br />
            <div className={settingsStyles['setting-content-container']}>
              <Box mb={4}>
                <SwitchComponent
                  checked={settings.text_similarity_enabled}
                  helperContent="Uses Elasticsearch for basic syntactic matching. It finds sentences that are written in a similar way, even if their meanings differ."
                  label="Text matching"
                  labelPlacement="end"
                  onChange={() => handleSettingsChange('text_similarity_enabled', !settings.text_similarity_enabled)}
                />
                <br />
                <ThresholdControl
                  disabled={!settings.text_similarity_enabled}
                  label="Elasticsearch matching threshold"
                  type="matching"
                  value={Number(settings.text_elasticsearch_matching_threshold * 100).toFixed()}
                  onChange={newValue => handleThresholdChange('text_elasticsearch_matching_threshold', newValue)}
                />
                <ThresholdControl
                  disabled={!settings.text_similarity_enabled}
                  error={(settings.text_elasticsearch_suggestion_threshold > settings.text_elasticsearch_matching_threshold)}
                  label="Elasticsearch suggestion threshold"
                  type="suggestion"
                  value={Number(settings.text_elasticsearch_suggestion_threshold * 100).toFixed()}
                  onChange={newValue => handleThresholdChange('text_elasticsearch_suggestion_threshold', newValue)}
                />
                <Box ml={7}>
                  <FormattedMessage
                    defaultMessage="Minimum words required for a confirmed match"
                    description="A label on a text input where the user specifies the minimum number of words needed to match before a text content match is considered confirmed"
                    id="similarityComponent.textLength"
                  />
                  <TextField
                    className={settingsStyles['similarity-component-input']}
                    disabled={!settings.text_similarity_enabled}
                    size="small"
                    type="number"
                    value={settings.text_length_matching_threshold}
                    variant="outlined"
                    onChange={(e) => { handleSettingsChange('text_length_matching_threshold', e.target.value); }}
                  />
                </Box>
              </Box>
              <Box mb={4}>
                <Box ml={6}>
                  <SwitchComponent
                    checked={settings.text_similarity_enabled && vectorModelToggle}
                    disabled={!settings.text_similarity_enabled}
                    helperContent="Allow for cross lingual matches as well as deeper semantic matches that Elasticsearch may not catch directly."
                    label="Vector model"
                    labelPlacement="end"
                    onChange={() => handleVectorModelToggle(!vectorModelToggle)}
                  />
                  <Box mb={2} ml={7} mr={6} mt={2}>
                    <p><strong>Model to use</strong></p>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={settings.alegre_model_in_use.includes(PARAPHRASE_MULTILINGUAL_MODEL)}
                          onChange={() => handleModelSettingsChange(PARAPHRASE_MULTILINGUAL_MODEL)}
                        />
                      }
                      disabled={!vectorModelToggle || !settings.text_similarity_enabled}
                      label="Paraphrase multilingual - New model, covers 50+ languages"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={settings.alegre_model_in_use.includes(MEAN_TOKENS_MODEL)}
                          onChange={() => handleModelSettingsChange(MEAN_TOKENS_MODEL)}
                        />
                      }
                      disabled={!vectorModelToggle || !settings.text_similarity_enabled}
                      label="Means tokens - Covers all languages"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={settings.alegre_model_in_use.includes(INDIAN_MODEL)}
                          onChange={() => handleModelSettingsChange(INDIAN_MODEL)}
                        />
                      }
                      disabled={!vectorModelToggle || !settings.text_similarity_enabled}
                      label="Indian SBERT - Specialized in Hindi, Bengali, Malayalam, and Tamil"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={settings.alegre_model_in_use.includes(FILIPINO_MODEL)}
                          onChange={() => handleModelSettingsChange(FILIPINO_MODEL)}
                        />
                      }
                      disabled={!vectorModelToggle || !settings.text_similarity_enabled}
                      label="Filipino Paraphrase - Specialized in Filipino"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={settings.alegre_model_in_use.includes(OPENAI_ADA_MODEL)}
                          onChange={() => handleModelSettingsChange(OPENAI_ADA_MODEL)}
                        />
                      }
                      disabled={!vectorModelToggle || !settings.text_similarity_enabled}
                      label="OpenAI ada model - Experimental, pay-per-use model"
                    />
                  </Box>
                  <ThresholdControl
                    disabled={!vectorModelToggle || !settings.text_similarity_enabled}
                    label="Vector model matching threshold"
                    type="matching"
                    value={Number(settings.text_vector_matching_threshold * 100).toFixed()}
                    onChange={newValue => handleThresholdChange('text_vector_matching_threshold', newValue)}
                  />
                  <ThresholdControl
                    disabled={!vectorModelToggle || !settings.text_similarity_enabled}
                    error={(settings.text_vector_suggestion_threshold > settings.text_vector_matching_threshold)}
                    label="Vector model suggestion threshold"
                    type="suggestion"
                    value={Number(settings.text_vector_suggestion_threshold * 100).toFixed()}
                    onChange={newValue => handleThresholdChange('text_vector_suggestion_threshold', newValue)}
                  />
                </Box>
              </Box>
              <Box mb={4}>
                <SwitchComponent
                  checked={settings.image_similarity_enabled}
                  label="Image matching"
                  labelPlacement="end"
                  onChange={() => handleSettingsChange('image_similarity_enabled', !settings.image_similarity_enabled)}
                />
                <br />
                <ThresholdControl
                  disabled={!settings.image_similarity_enabled}
                  label="Image matching threshold"
                  type="matching"
                  value={Number(settings.image_hash_matching_threshold * 100).toFixed()}
                  onChange={newValue => handleThresholdChange('image_hash_matching_threshold', newValue)}
                />
                <ThresholdControl
                  disabled={!settings.image_similarity_enabled}
                  error={(settings.image_hash_suggestion_threshold > settings.image_hash_matching_threshold)}
                  label="Image suggestion threshold"
                  type="suggestion"
                  value={Number(settings.image_hash_suggestion_threshold * 100).toFixed()}
                  onChange={newValue => handleThresholdChange('image_hash_suggestion_threshold', newValue)}
                />
              </Box>
              <Box mb={4}>
                <SwitchComponent
                  checked={settings.video_similarity_enabled}
                  label="Video matching"
                  labelPlacement="end"
                  onChange={() => handleSettingsChange('video_similarity_enabled', !settings.video_similarity_enabled)}
                />
                <br />
                <ThresholdControl
                  disabled={!settings.video_similarity_enabled}
                  label="Video matching threshold"
                  type="matching"
                  value={Number(settings.video_hash_matching_threshold * 100).toFixed()}
                  onChange={newValue => handleThresholdChange('video_hash_matching_threshold', newValue)}
                />
                <ThresholdControl
                  disabled={!settings.video_similarity_enabled}
                  error={(settings.video_hash_suggestion_threshold > settings.video_hash_matching_threshold)}
                  label="Video suggestion threshold"
                  type="suggestion"
                  value={Number(settings.video_hash_suggestion_threshold * 100).toFixed()}
                  onChange={newValue => handleThresholdChange('video_hash_suggestion_threshold', newValue)}
                />
              </Box>
              <Box mb={4}>
                <SwitchComponent
                  checked={settings.audio_similarity_enabled}
                  label="Audio matching"
                  labelPlacement="end"
                  onChange={() => handleSettingsChange('audio_similarity_enabled', !settings.audio_similarity_enabled)}
                />
                <br />
                <ThresholdControl
                  disabled={!settings.audio_similarity_enabled}
                  label="Audio matching threshold"
                  type="matching"
                  value={Number(settings.audio_hash_matching_threshold * 100).toFixed()}
                  onChange={newValue => handleThresholdChange('audio_hash_matching_threshold', newValue)}
                />
                <ThresholdControl
                  disabled={!settings.audio_similarity_enabled}
                  error={(settings.audio_hash_suggestion_threshold > settings.audio_hash_matching_threshold)}
                  label="Audio suggestion threshold"
                  type="suggestion"
                  value={Number(settings.audio_hash_suggestion_threshold * 100).toFixed()}
                  onChange={newValue => handleThresholdChange('audio_hash_suggestion_threshold', newValue)}
                />
              </Box>
              <Box mb={4}>
                <SwitchComponent
                  checked={settings.transcription_similarity_enabled}
                  label="Automated transcription"
                  labelPlacement="end"
                  onChange={() => handleSettingsChange('transcription_similarity_enabled', !settings.transcription_similarity_enabled)}
                />
                <Box mb={2} ml={7}>
                  <FormattedMessage
                    defaultMessage="Minimum duration in seconds"
                    description="number input for Automated transcription minimum duration"
                    id="similarityComponent.minimumDuration"
                  />
                  <TextField
                    className={settingsStyles['similarity-component-input']}
                    disabled={!settings.transcription_similarity_enabled}
                    size="small"
                    type="number"
                    value={settings.transcription_minimum_duration}
                    variant="outlined"
                    onChange={(e) => { handleSettingsChange('transcription_minimum_duration', e.target.value); }}
                  />
                </Box>
                <Box mb={2} ml={7}>
                  <FormattedMessage
                    defaultMessage="Maximum duration in seconds"
                    description="number input for Automated transcription maximum duration"
                    id="similarityComponent.maximumDuration"
                  />
                  <TextField
                    className={settingsStyles['similarity-component-input']}
                    disabled={!settings.transcription_similarity_enabled}
                    size="small"
                    type="number"
                    value={settings.transcription_maximum_duration}
                    variant="outlined"
                    onChange={(e) => { handleSettingsChange('transcription_maximum_duration', e.target.value); }}
                  />
                </Box>
                <Box mb={2} ml={7}>
                  <FormattedMessage
                    defaultMessage="Minimum number of requests"
                    description="number input for Automated transcription duration requests"
                    id="similarityComponent.minimumRequests"
                  />
                  <TextField
                    className={settingsStyles['similarity-component-input']}
                    disabled={!settings.transcription_similarity_enabled}
                    size="small"
                    type="number"
                    value={settings.transcription_minimum_requests}
                    variant="outlined"
                    onChange={(e) => { handleSettingsChange('transcription_minimum_requests', e.target.value); }}
                  />
                </Box>
              </Box>
              <Box mb={4}>
                <TextField
                  fullWidth
                  label={
                    <FormattedMessage
                      defaultMessage="Language analyzer for similarity matching (for example, 'pt', 'en', etc.)"
                      description="Text input for language similarity matching settings"
                      id="similarityComponent.languageForSimilarity"
                    />
                  }
                  value={settings.language_for_similarity}
                  variant="outlined"
                  onChange={(e) => { handleSettingsChange('language_for_similarity', e.target.value); }}
                />
              </Box>
              <Box mb={4}>
                <TextField
                  fullWidth
                  label={
                    <FormattedMessage
                      defaultMessage="Minimum score for ElasticSearch"
                      description="number input for the minimum matching score for ElasticSearch"
                      id="similarityComponent.minEsScore"
                    />
                  }
                  type="number"
                  value={settings.min_es_score}
                  variant="outlined"
                  onChange={(e) => { handleSettingsChange('min_es_score', parseInt(e.target.value, 10)); }}
                />
              </Box>
            </div>
          </React.Fragment>
        ) : null }
      </div>
    </React.Fragment>
  );
};

SimilarityComponent.propTypes = {
  team: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  setFlashMessage: PropTypes.func.isRequired,
  user: PropTypes.shape({
    is_admin: PropTypes.bool.isRequired,
  }).isRequired,
};

export default createFragmentContainer(withSetFlashMessage(SimilarityComponent), graphql`
  fragment SimilarityComponent_team on Team {
    id
    name
    permissions
    alegre_bot: team_bot_installation(bot_identifier: "alegre") {
      id
      lock_version
      alegre_settings
    }
  }
`);
