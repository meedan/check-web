import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import SmoochBotIntegrations from './SmoochBotIntegrations';
import SmoochBotSetting from './SmoochBotSetting';

const SmoochBotSettings = (props) => {
  // Besides the settings defined in the schema, we add one newsletter template header setting for each language.
  // This is not defined in the schema on the backend side because it depends on the supported languages and also because it's used only on the UI.
  const fields = props.schema;
  props.languages.forEach((language) => {
    fields[`smooch_template_newsletter_header_${language}`] = {
      type: 'string',
      title: `${language.toUpperCase()} newsletter header`,
      description: '',
      default: 'Hi! Here are your weekly facts. This newsletter is published on {channel} by {teamName}. Here are the most important facts for the week of {date}:',
    };
  });

  return (
    <React.Fragment>
      <SmoochBotIntegrations
        settings={props.settings}
        schema={props.schema}
        enabledIntegrations={props.enabledIntegrations}
        installationId={props.installationId}
      />

      {['smooch_urls_to_ignore', 'smooch_time_to_send_request', 'smooch_disabled'].map(field => (
        <SmoochBotSetting
          field={field}
          value={props.settings[field]}
          schema={fields[field]}
          onChange={props.onChange}
        />
      ))}

      { props.currentUser.is_admin ?
        <Box mt={2}>
          <Typography variant="h6" component="div">
            <FormattedMessage id="smoochBotSettings.internalSettings" defaultMessage="Internal settings" description="Title of Internal Settings section in the tipline settings page" />
          </Typography>

          <Typography variant="subtitle1" component="div">
            <FormattedMessage id="smoochBotSettings.internalSettingsDescription" defaultMessage="Meedan employees see these settings, but users don't." description="Description of Internal Settings section in the tipline settings page. The word Meedan does not need to be translated." />
          </Typography>

          { props.settings.smooch_version === 'v2' ?
            <Box mt={1}>
              <Typography variant="subtitle1" component="div">
                <FormattedMessage id="smoochBotSettings.searchSettings" defaultMessage="Search settings" description="Title of Search settings section in the tipline settings page." />
              </Typography>

              {['smooch_search_text_similarity_threshold', 'smooch_search_max_keyword'].map(field => (
                <SmoochBotSetting
                  field={field}
                  value={props.settings[field]}
                  schema={fields[field]}
                  onChange={props.onChange}
                  currentUser={props.currentUser}
                />
              ))}
            </Box> : null }

          <Box mt={1}>
            <Typography variant="subtitle1" component="div">
              <FormattedMessage id="smoochBotSettings.sunshineSettings" defaultMessage="Sunshine integration settings" description="Title of Sunshine settings section in the tipline settings page. The word Sunshine does not need to be translated." />
            </Typography>

            {['smooch_app_id', 'smooch_secret_key_key_id', 'smooch_secret_key_secret', 'smooch_webhook_secret'].map(field => (
              <SmoochBotSetting
                field={field}
                value={props.settings[field]}
                schema={fields[field]}
                onChange={props.onChange}
                currentUser={props.currentUser}
              />
            ))}
          </Box>

          <Box mt={1}>
            <Typography variant="subtitle1" component="div">
              <FormattedMessage id="smoochBotSettings.templatesSettings" defaultMessage="Templates settings" description="Title of templates settings section in the tipline settings page." />
            </Typography>

            {['smooch_template_namespace', 'smooch_template_locales'].map(field => (
              <SmoochBotSetting
                field={field}
                value={props.settings[field]}
                schema={fields[field]}
                onChange={props.onChange}
                currentUser={props.currentUser}
              />
            ))}

            {Object.keys(fields).filter(f => /^smooch_template_newsletter_header_/.test(f)).map(field => (
              <SmoochBotSetting
                field={field}
                value={props.settings[field]}
                schema={fields[field]}
                onChange={props.onChange}
                currentUser={props.currentUser}
              />
            ))}

            {Object.keys(fields).filter(f => /^smooch_template_name_for_/.test(f)).map(field => (
              <SmoochBotSetting
                field={field}
                value={props.settings[field]}
                schema={fields[field]}
                onChange={props.onChange}
                currentUser={props.currentUser}
              />
            ))}
          </Box>

          <Box mt={1}>
            <Typography variant="subtitle1" component="div">
              <FormattedMessage id="smoochBotSettings.bspSettings" defaultMessage="WhatsApp BSP settings" description="Title of 'WhatsApp BSP' settings section in the tipline settings page. The words WhatsApp BSP do not need to be translated." />
            </Typography>

            {Object.keys(fields).filter(f => /^turnio_/.test(f)).map(field => (
              <SmoochBotSetting
                field={field}
                value={props.settings[field]}
                schema={fields[field]}
                onChange={props.onChange}
                currentUser={props.currentUser}
              />
            ))}
          </Box>
        </Box> : null }
    </React.Fragment>
  );
};

SmoochBotSettings.defaultProps = {
  languages: [],
};

SmoochBotSettings.propTypes = {
  settings: PropTypes.object.isRequired,
  schema: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  enabledIntegrations: PropTypes.object.isRequired,
  installationId: PropTypes.string.isRequired,
  languages: PropTypes.array,
};

export default SmoochBotSettings;
