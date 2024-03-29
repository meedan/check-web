import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import SmoochBotIntegrations from './SmoochBotIntegrations';
import SmoochBotSetting from './SmoochBotSetting';
import styles from '../Settings.module.css';

const SmoochBotSettings = (props) => {
  const fields = props.schema;

  return (
    <React.Fragment>
      <SmoochBotIntegrations
        settings={props.settings}
        schema={props.schema}
        enabledIntegrations={props.enabledIntegrations}
        installationId={props.installationId}
      />

      <SmoochBotSetting
        field="smooch_disabled"
        value={props.settings.smooch_disabled}
        schema={fields.smooch_disabled}
        onChange={props.onChange}
      />

      { props.currentUser.is_admin ?
        <div className={styles['tipline-admin-settings']}>
          <div className={styles['setting-content-container-title']}>
            <FormattedMessage id="smoochBotSettings.internalSettings" defaultMessage="Internal settings" description="Title of Internal Settings section in the tipline settings page" />
          </div>
          <FormattedMessage tagName="p" id="smoochBotSettings.internalSettingsDescription" defaultMessage="Meedan employees see these settings, but users don't." description="Description of Internal Settings section in the tipline settings page. The word Meedan does not need to be translated." />

          <div className={styles['setting-content-container-inner']}>
            <div className={styles['setting-content-container-title']}>
              <FormattedMessage id="smoochBotSettings.searchSettings" defaultMessage="Search settings" description="Title of Search settings section in the tipline settings page." />
            </div>

            {['smooch_search_text_similarity_threshold', 'smooch_search_max_keyword'].map(field => (
              <SmoochBotSetting
                field={field}
                value={props.settings[field]}
                schema={fields[field]}
                onChange={props.onChange}
                currentUser={props.currentUser}
              />
            ))}
          </div>

          <div className={styles['setting-content-container-inner']}>
            <div className={styles['setting-content-container-title']}>
              <FormattedMessage id="smoochBotSettings.sunshineSettings" defaultMessage="Sunshine integration settings" description="Title of Sunshine settings section in the tipline settings page. The word Sunshine does not need to be translated." />
            </div>

            {['smooch_app_id', 'smooch_secret_key_key_id', 'smooch_secret_key_secret', 'smooch_webhook_secret'].map(field => (
              <SmoochBotSetting
                field={field}
                value={props.settings[field]}
                schema={fields[field]}
                onChange={props.onChange}
                currentUser={props.currentUser}
              />
            ))}
          </div>

          <div className={styles['setting-content-container-inner']}>
            <div className={styles['setting-content-container-title']}>
              <FormattedMessage id="smoochBotSettings.templatesSettings" defaultMessage="Templates settings" description="Title of templates settings section in the tipline settings page." />
            </div>

            {['smooch_template_namespace', 'smooch_template_locales'].map(field => (
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
                value={props.settings[field] || ' '}
                schema={fields[field]}
                onChange={props.onChange}
                currentUser={props.currentUser}
              />
            ))}
          </div>

          <div className={styles['setting-content-container-inner']}>
            <div className={styles['setting-content-container-title']}>
              <FormattedMessage id="smoochBotSettings.onpremSettings" defaultMessage="WhatsApp On-Premises API settings" description="Title of 'WhatsApp On-Premises API' settings section in the tipline settings page. The words 'WhatsApp On-Premises API' do not need to be translated." />
            </div>

            {Object.keys(fields).filter(f => /^turnio_/.test(f)).map(field => (
              <SmoochBotSetting
                field={field}
                value={props.settings[field]}
                schema={fields[field]}
                onChange={props.onChange}
                currentUser={props.currentUser}
              />
            ))}
          </div>

          <div className={styles['setting-content-container-inner']}>
            <div className={styles['setting-content-container-title']}>
              <FormattedMessage id="smoochBotSettings.capiSettings" defaultMessage="WhatsApp Cloud API settings" description="Title of 'WhatsApp Cloud API' settings section in the tipline settings page. The words 'WhatsApp Cloud API' do not need to be translated." />
            </div>

            {Object.keys(fields).filter(f => /^capi_/.test(f)).map(field => (
              <SmoochBotSetting
                field={field}
                value={props.settings[field]}
                schema={fields[field]}
                onChange={props.onChange}
                currentUser={props.currentUser}
              />
            ))}
          </div>
        </div> : null }
    </React.Fragment>
  );
};

SmoochBotSettings.propTypes = {
  settings: PropTypes.object.isRequired,
  schema: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  enabledIntegrations: PropTypes.object.isRequired,
  installationId: PropTypes.string.isRequired,
};

export default SmoochBotSettings;
