/* eslint-disable relay/unused-fields */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, commitMutation, graphql } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import SwitchComponent from '../../cds/inputs/SwitchComponent';
import ThresholdControl from './ThresholdControl';
import SettingsHeader from '../SettingsHeader';
import Can from '../../Can';
import { withSetFlashMessage } from '../../FlashMessage';
import GenericUnknownErrorMessage from '../../GenericUnknownErrorMessage';
import { ContentColumn } from '../../../styles/js/shared';
import { getErrorObjectsForRelayModernProblem } from '../../../helpers';
import CheckError from '../../../CheckError';

const MEAN_TOKENS_MODEL = 'xlm-r-bert-base-nli-stsb-mean-tokens';
const INDIAN_MODEL = 'indian-sbert';
const ELASTICSEARCH_MODEL = 'elasticsearch';
const FILIPINO_MODEL = 'paraphrase-filipino-mpnet-base-v2';
const OPENAI_ADA_MODEL = 'openai-text-embedding-ada-002';

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(-1),
    width: theme.spacing(10),
  },
  inputMarginDense: {
    padding: '6px 8px',
  },
  transactionMargin: {
    marginRight: theme.spacing(2),
  },
}));

const SimilarityComponent = ({
  team,
  setFlashMessage,
  user,
}) => {
  const classes = useStyles();
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
        textSimilarityModel === OPENAI_ADA_MODEL
      );
    }
    return (
      textSimilarityModel.includes(MEAN_TOKENS_MODEL) ||
      textSimilarityModel.includes(INDIAN_MODEL) ||
      textSimilarityModel.includes(FILIPINO_MODEL) ||
      textSimilarityModel.includes(OPENAI_ADA_MODEL)
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
      newSettings.alegre_model_in_use = [];
      newSettings.text_similarity_model = ELASTICSEARCH_MODEL;
      setSettings(newSettings);
    } else {
      handleSettingsChange('text_similarity_model', MEAN_TOKENS_MODEL);
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
        id="similarityComponent.savedSuccessfully"
        defaultMessage="Similarity settings saved successfully"
        description="Banner displayed when similarity settings are saved successfully"
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
      <ContentColumn large>
        <SettingsHeader
          title={
            <FormattedMessage
              id="similarityComponent.title"
              defaultMessage="Similarity matching"
              description="Title to similarity matching settings page"
            />
          }
          subtitle={
            <FormattedMessage
              id="similarityComponent.blurb"
              defaultMessage="Automatically group items together if they are similar."
              description="Subtitle to similarity matching settings page"
            />
          }
          helpUrl="https://help.checkmedia.org/en/articles/4705965-similarity-matching-and-suggestions"
          actionButton={
            team.alegre_bot ?
              <Can permissions={team.permissions} permission="update Team">
                <Button color="primary" variant="contained" id="similarity-component__save" onClick={handleSave} disabled={saving || hasError}>
                  <FormattedMessage id="similarityComponent.save" defaultMessage="Save" description="Label for Save Button on Similarity settings page" />
                </Button>
              </Can> : null
          }
        />
        <Card>
          <CardContent>
            <Box mt={2.5}>
              <SwitchComponent
                checked={settings.master_similarity_enabled}
                onChange={() => handleSettingsChange('master_similarity_enabled', !settings.master_similarity_enabled)}
                labelPlacement="end"
                label={
                  settings.master_similarity_enabled ?
                    <FormattedMessage id="similarityComponent.masterSwitchLabelOn" defaultMessage="Automated matching is ON" description="Switch input label when switch is set to automatic matching" /> :
                    <FormattedMessage id="similarityComponent.masterSwitchLabelOff" defaultMessage="Automated matching is OFF" description="Switch input label when switch is set to not automatic match" />
                }
              />
              <Box mb={2} ml={7} color={settings.master_similarity_enabled ? '' : 'gray'}>
                <Box display="flex" alignItems="center">
                  <FormControlLabel
                    control={
                      <Checkbox
                        disabled={!settings.master_similarity_enabled}
                        checked={settings.date_similarity_threshold_enabled}
                        onChange={() => handleSettingsChange('date_similarity_threshold_enabled', !settings.date_similarity_threshold_enabled)}
                      />
                    }
                    label={
                      <FormattedMessage
                        id="similarityComponent.dateThresholdSettings"
                        defaultMessage="Limit matching to recently submitted content"
                        description="Allow user to enable/disable similarity matching based on submitted date"
                      />
                    }
                  />
                </Box>
                <Box ml={4} mt={1}>
                  <FormattedMessage
                    id="similarityComponent.dateThreshold"
                    defaultMessage="Similar content last submitted more than {maxTime} months ago will only be suggested"
                    description="Number input for how many month back similarity suggestions will be processed for"
                    values={{
                      maxTime: (
                        <TextField
                          classes={{ root: classes.root }}
                          // Please note InputProps and inputProps are different things
                          // The former goes to the React comp and the latter to the inner html `input` element
                          InputProps={{ classes: { inputMarginDense: classes.inputMarginDense } }}
                          inputProps={{ min: 0 }} // eslint-disable-line react/jsx-no-duplicate-props
                          variant="outlined"
                          size="small"
                          value={settings.similarity_date_threshold}
                          onChange={(e) => { handleSettingsChange('similarity_date_threshold', e.target.value); }}
                          type="number"
                          disabled={!settings.date_similarity_threshold_enabled}
                        />
                      ),
                    }}
                  />
                </Box>
              </Box>
              <Box mt={1}>
                <SwitchComponent
                  checked={settings.single_language_fact_checks_enabled}
                  onChange={() => handleSettingsChange('single_language_fact_checks_enabled', !settings.single_language_fact_checks_enabled)}
                  labelPlacement="end"
                  label={
                    <FormattedMessage id="similarityComponent.singleLanguageFactChecksEnabled" description="Label displayed when similarity setting for single language fact-checks is enabled" defaultMessage="Only send fact-checks in the same language as the conversation language" />
                  }
                />
              </Box>
            </Box>
          </CardContent>
        </Card>
        { settings.master_similarity_enabled && isSuperAdmin ? (
          <React.Fragment>
            <SettingsHeader
              title="Internal settings"
              subtitle="Meedan employees see these settings, but users don't."
            />
            <Card>
              <CardContent>
                <Box mb={4}>
                  <SwitchComponent
                    checked={settings.text_similarity_enabled}
                    onChange={() => handleSettingsChange('text_similarity_enabled', !settings.text_similarity_enabled)}
                    labelPlacement="end"
                    label="Text matching"
                    helperContent="Uses Elasticsearch for basic syntactic matching. It finds sentences that are written in a similar way, even if their meanings differ."
                  />
                  <br />
                  <ThresholdControl
                    value={Number(settings.text_elasticsearch_matching_threshold * 100).toFixed()}
                    onChange={newValue => handleThresholdChange('text_elasticsearch_matching_threshold', newValue)}
                    disabled={!settings.text_similarity_enabled}
                    type="matching"
                    label="Elasticsearch matching threshold"
                  />
                  <ThresholdControl
                    value={Number(settings.text_elasticsearch_suggestion_threshold * 100).toFixed()}
                    onChange={newValue => handleThresholdChange('text_elasticsearch_suggestion_threshold', newValue)}
                    disabled={!settings.text_similarity_enabled}
                    type="suggestion"
                    label="Elasticsearch suggestion threshold"
                    error={(settings.text_elasticsearch_suggestion_threshold > settings.text_elasticsearch_matching_threshold)}
                  />
                  <Box ml={7}>
                    <Typography component="span" style={{ fontWeight: 'bold' }} className={classes.transactionMargin}>
                      <FormattedMessage
                        id="similarityComponent.textLength"
                        defaultMessage="Minimum words required for a confirmed match"
                        description="A label on a text input where the user specifies the minimum number of words needed to match before a text content match is considered confirmed"
                      />
                    </Typography>
                    <TextField
                      classes={{ root: classes.root }}
                      variant="outlined"
                      size="small"
                      value={settings.text_length_matching_threshold}
                      onChange={(e) => { handleSettingsChange('text_length_matching_threshold', e.target.value); }}
                      type="number"
                      disabled={!settings.text_similarity_enabled}
                    />
                  </Box>
                </Box>
                <Box mb={4}>
                  <Box ml={6}>
                    <SwitchComponent
                      checked={settings.text_similarity_enabled && vectorModelToggle}
                      disabled={!settings.text_similarity_enabled}
                      onChange={() => handleVectorModelToggle(!vectorModelToggle)}
                      labelPlacement="end"
                      label="Vector model"
                      helperContent="Allow for cross lingual matches as well as deeper semantic matches that Elasticsearch may not catch directly."
                    />
                    <Box ml={7} mb={2} mt={2} mr={6}>
                      <p><strong>Model to use</strong></p>
                      <FormControlLabel
                        disabled={!vectorModelToggle || !settings.text_similarity_enabled}
                        control={
                          <Checkbox
                            checked={settings.alegre_model_in_use.includes(MEAN_TOKENS_MODEL)}
                            onChange={() => handleModelSettingsChange(MEAN_TOKENS_MODEL)}
                          />
                        }
                        label="Means tokens - Covers all languages"
                      />
                      <FormControlLabel
                        disabled={!vectorModelToggle || !settings.text_similarity_enabled}
                        control={
                          <Checkbox
                            checked={settings.alegre_model_in_use.includes(INDIAN_MODEL)}
                            onChange={() => handleModelSettingsChange(INDIAN_MODEL)}
                          />
                        }
                        label="Indian SBERT - Specialized in Hindi, Bengali, Malayalam, and Tamil"
                      />
                      <FormControlLabel
                        disabled={!vectorModelToggle || !settings.text_similarity_enabled}
                        control={
                          <Checkbox
                            checked={settings.alegre_model_in_use.includes(FILIPINO_MODEL)}
                            onChange={() => handleModelSettingsChange(FILIPINO_MODEL)}
                          />
                        }
                        label="Filipino Paraphrase - Specialized in Filipino"
                      />
                      <FormControlLabel
                        disabled={!vectorModelToggle || !settings.text_similarity_enabled}
                        control={
                          <Checkbox
                            checked={settings.alegre_model_in_use.includes(OPENAI_ADA_MODEL)}
                            onChange={() => handleModelSettingsChange(OPENAI_ADA_MODEL)}
                          />
                        }
                        label="OpenAI ada model - Experimental, pay-per-use model"
                      />
                    </Box>
                    <ThresholdControl
                      value={Number(settings.text_vector_matching_threshold * 100).toFixed()}
                      onChange={newValue => handleThresholdChange('text_vector_matching_threshold', newValue)}
                      disabled={!vectorModelToggle || !settings.text_similarity_enabled}
                      type="matching"
                      label="Vector model matching threshold"
                    />
                    <ThresholdControl
                      value={Number(settings.text_vector_suggestion_threshold * 100).toFixed()}
                      onChange={newValue => handleThresholdChange('text_vector_suggestion_threshold', newValue)}
                      disabled={!vectorModelToggle || !settings.text_similarity_enabled}
                      type="suggestion"
                      label="Vector model suggestion threshold"
                      error={(settings.text_vector_suggestion_threshold > settings.text_vector_matching_threshold)}
                    />
                  </Box>
                </Box>
                <Box mb={4}>
                  <SwitchComponent
                    checked={settings.image_similarity_enabled}
                    onChange={() => handleSettingsChange('image_similarity_enabled', !settings.image_similarity_enabled)}
                    labelPlacement="end"
                    label="Image matching"
                  />
                  <br />
                  <ThresholdControl
                    value={Number(settings.image_hash_matching_threshold * 100).toFixed()}
                    onChange={newValue => handleThresholdChange('image_hash_matching_threshold', newValue)}
                    disabled={!settings.image_similarity_enabled}
                    type="matching"
                    label="Image matching threshold"
                  />
                  <ThresholdControl
                    value={Number(settings.image_hash_suggestion_threshold * 100).toFixed()}
                    onChange={newValue => handleThresholdChange('image_hash_suggestion_threshold', newValue)}
                    disabled={!settings.image_similarity_enabled}
                    type="suggestion"
                    label="Image suggestion threshold"
                    error={(settings.image_hash_suggestion_threshold > settings.image_hash_matching_threshold)}
                  />
                </Box>
                <Box mb={4}>
                  <SwitchComponent
                    checked={settings.video_similarity_enabled}
                    onChange={() => handleSettingsChange('video_similarity_enabled', !settings.video_similarity_enabled)}
                    labelPlacement="end"
                    label="Video matching"
                  />
                  <br />
                  <ThresholdControl
                    value={Number(settings.video_hash_matching_threshold * 100).toFixed()}
                    onChange={newValue => handleThresholdChange('video_hash_matching_threshold', newValue)}
                    disabled={!settings.video_similarity_enabled}
                    type="matching"
                    label="Video matching threshold"
                  />
                  <ThresholdControl
                    value={Number(settings.video_hash_suggestion_threshold * 100).toFixed()}
                    onChange={newValue => handleThresholdChange('video_hash_suggestion_threshold', newValue)}
                    disabled={!settings.video_similarity_enabled}
                    type="suggestion"
                    label="Video suggestion threshold"
                    error={(settings.video_hash_suggestion_threshold > settings.video_hash_matching_threshold)}
                  />
                </Box>
                <Box mb={4}>
                  <SwitchComponent
                    checked={settings.audio_similarity_enabled}
                    onChange={() => handleSettingsChange('audio_similarity_enabled', !settings.audio_similarity_enabled)}
                    labelPlacement="end"
                    label="Audio matching"
                  />
                  <br />
                  <ThresholdControl
                    value={Number(settings.audio_hash_matching_threshold * 100).toFixed()}
                    onChange={newValue => handleThresholdChange('audio_hash_matching_threshold', newValue)}
                    disabled={!settings.audio_similarity_enabled}
                    type="matching"
                    label="Audio matching threshold"
                  />
                  <ThresholdControl
                    value={Number(settings.audio_hash_suggestion_threshold * 100).toFixed()}
                    onChange={newValue => handleThresholdChange('audio_hash_suggestion_threshold', newValue)}
                    disabled={!settings.audio_similarity_enabled}
                    type="suggestion"
                    label="Audio suggestion threshold"
                    error={(settings.audio_hash_suggestion_threshold > settings.audio_hash_matching_threshold)}
                  />
                </Box>
                <Box mb={4}>
                  <SwitchComponent
                    checked={settings.transcription_similarity_enabled}
                    onChange={() => handleSettingsChange('transcription_similarity_enabled', !settings.transcription_similarity_enabled)}
                    labelPlacement="end"
                    label="Automated transcription"
                  />
                  <Box mb={2} ml={7}>
                    <Typography component="span" className={classes.transactionMargin}>
                      <FormattedMessage
                        id="similarityComponent.minimumDuration"
                        defaultMessage="Minimum duration in seconds"
                        description="number input for Automated transcription minimum duration"
                      />
                    </Typography>
                    <TextField
                      classes={{ root: classes.root }}
                      variant="outlined"
                      size="small"
                      value={settings.transcription_minimum_duration}
                      onChange={(e) => { handleSettingsChange('transcription_minimum_duration', e.target.value); }}
                      type="number"
                      disabled={!settings.transcription_similarity_enabled}
                    />
                  </Box>
                  <Box mb={2} ml={7}>
                    <Typography component="span" className={classes.transactionMargin}>
                      <FormattedMessage
                        id="similarityComponent.maximumDuration"
                        defaultMessage="Maximum duration in seconds"
                        description="number input for Automated transcription maximum duration"
                      />
                    </Typography>
                    <TextField
                      classes={{ root: classes.root }}
                      variant="outlined"
                      size="small"
                      value={settings.transcription_maximum_duration}
                      onChange={(e) => { handleSettingsChange('transcription_maximum_duration', e.target.value); }}
                      type="number"
                      disabled={!settings.transcription_similarity_enabled}
                    />
                  </Box>
                  <Box mb={2} ml={7}>
                    <Typography component="span" className={classes.transactionMargin}>
                      <FormattedMessage
                        id="similarityComponent.minimumRequests"
                        defaultMessage="Minimum number of requests"
                        description="number input for Automated transcription duration requests"
                      />
                    </Typography>
                    <TextField
                      classes={{ root: classes.root }}
                      variant="outlined"
                      size="small"
                      value={settings.transcription_minimum_requests}
                      onChange={(e) => { handleSettingsChange('transcription_minimum_requests', e.target.value); }}
                      type="number"
                      disabled={!settings.transcription_similarity_enabled}
                    />
                  </Box>
                </Box>
                <Box mb={4}>
                  <TextField
                    label={
                      <FormattedMessage
                        id="similarityComponent.languageForSimilarity"
                        defaultMessage="Language analyzer for similarity matching (for example, 'pt', 'en', etc.)"
                        description="Text input for language similarity matching settings"
                      />
                    }
                    variant="outlined"
                    size="small"
                    value={settings.language_for_similarity}
                    onChange={(e) => { handleSettingsChange('language_for_similarity', e.target.value); }}
                    fullWidth
                  />
                </Box>
                <Box mb={4}>
                  <TextField
                    label={
                      <FormattedMessage
                        id="similarityComponent.minEsScore"
                        defaultMessage="Minimum score for ElasticSearch"
                        description="number input for the minimum matching score for ElasticSearch"
                      />
                    }
                    variant="outlined"
                    size="small"
                    type="number"
                    value={settings.min_es_score}
                    onChange={(e) => { handleSettingsChange('min_es_score', parseInt(e.target.value, 10)); }}
                    fullWidth
                  />
                </Box>
              </CardContent>
            </Card>
          </React.Fragment>
        ) : null }
      </ContentColumn>
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
