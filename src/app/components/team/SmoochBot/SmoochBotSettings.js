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
      <div className={styles['setting-content-container-title']}>
        <FormattedMessage defaultMessage="Messaging Platforms" description="Title of available messaging platforms that can be connected in the tipline settings page" id="smoochBotSettings.messagingPlatform" />
      </div>

      <SmoochBotIntegrations
        enabledIntegrations={props.enabledIntegrations}
        installationId={props.installationId}
        schema={props.schema}
        settings={props.settings}
      />

      <SmoochBotSetting
        field="smooch_disabled"
        schema={fields.smooch_disabled}
        value={props.settings.smooch_disabled}
        onChange={props.onChange}
      />

      { props.currentUser.is_admin ?
        <div className={styles['tipline-admin-settings']}>
          <div className={styles['setting-content-container-title']}>
            <FormattedMessage defaultMessage="Internal settings" description="Title of Internal Settings section in the tipline settings page" id="smoochBotSettings.internalSettings" />
          </div>
          <FormattedMessage defaultMessage="Meedan employees see these settings, but users don't." description="Description of Internal Settings section in the tipline settings page. The word Meedan does not need to be translated." id="smoochBotSettings.internalSettingsDescription" tagName="p" />

          <div className={styles['setting-content-container-inner']}>
            <div className={styles['setting-content-container-title']}>
              <FormattedMessage defaultMessage="Search settings" description="Title of Search settings section in the tipline settings page." id="smoochBotSettings.searchSettings" />
            </div>

            {['smooch_search_text_similarity_threshold', 'smooch_search_max_keyword'].map(field => (
              <SmoochBotSetting
                currentUser={props.currentUser}
                field={field}
                schema={fields[field]}
                value={props.settings[field]}
                onChange={props.onChange}
              />
            ))}
          </div>

          <div className={styles['setting-content-container-inner']}>
            <div className={styles['setting-content-container-title']}>
              <FormattedMessage defaultMessage="Sunshine integration settings" description="Title of Sunshine settings section in the tipline settings page. The word Sunshine does not need to be translated." id="smoochBotSettings.sunshineSettings" />
            </div>

            {['smooch_app_id', 'smooch_secret_key_key_id', 'smooch_secret_key_secret', 'smooch_webhook_secret'].map(field => (
              <SmoochBotSetting
                currentUser={props.currentUser}
                field={field}
                schema={fields[field]}
                value={props.settings[field]}
                onChange={props.onChange}
              />
            ))}
          </div>

          <div className={styles['setting-content-container-inner']}>
            <div className={styles['setting-content-container-title']}>
              <FormattedMessage defaultMessage="Templates settings" description="Title of templates settings section in the tipline settings page." id="smoochBotSettings.templatesSettings" />
            </div>

            {['smooch_template_namespace', 'smooch_template_locales'].map(field => (
              <SmoochBotSetting
                currentUser={props.currentUser}
                field={field}
                schema={fields[field]}
                value={props.settings[field]}
                onChange={props.onChange}
              />
            ))}

            {Object.keys(fields).filter(f => /^smooch_template_name_for_/.test(f)).map(field => (
              <SmoochBotSetting
                currentUser={props.currentUser}
                field={field}
                schema={fields[field]}
                value={props.settings[field] || ' '}
                onChange={props.onChange}
              />
            ))}
          </div>

          <div className={styles['setting-content-container-inner']}>
            <div className={styles['setting-content-container-title']}>
              <FormattedMessage defaultMessage="WhatsApp On-Premises API settings" description="Title of 'WhatsApp On-Premises API' settings section in the tipline settings page. The words 'WhatsApp On-Premises API' do not need to be translated." id="smoochBotSettings.onpremSettings" />
            </div>

            {Object.keys(fields).filter(f => /^turnio_/.test(f)).map(field => (
              <SmoochBotSetting
                currentUser={props.currentUser}
                field={field}
                schema={fields[field]}
                value={props.settings[field]}
                onChange={props.onChange}
              />
            ))}
          </div>

          <div className={styles['setting-content-container-inner']}>
            <div className={styles['setting-content-container-title']}>
              <FormattedMessage defaultMessage="WhatsApp Cloud API settings" description="Title of 'WhatsApp Cloud API' settings section in the tipline settings page. The words 'WhatsApp Cloud API' do not need to be translated." id="smoochBotSettings.capiSettings" />
            </div>

            {Object.keys(fields).filter(f => /^capi_/.test(f)).map(field => (
              <SmoochBotSetting
                currentUser={props.currentUser}
                field={field}
                schema={fields[field]}
                value={props.settings[field]}
                onChange={props.onChange}
              />
            ))}
          </div>
        </div> : null }
    </React.Fragment>
  );
};

SmoochBotSettings.propTypes = {
  currentUser: PropTypes.object.isRequired,
  enabledIntegrations: PropTypes.object.isRequired,
  installationId: PropTypes.string.isRequired,
  schema: PropTypes.object.isRequired,
  settings: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default SmoochBotSettings;
