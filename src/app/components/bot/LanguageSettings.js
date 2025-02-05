import React from 'react';
import { FormattedMessage } from 'react-intl';
import Alert from '../cds/alerts-and-prompts/Alert';
import SwitchComponent from '../cds/inputs/SwitchComponent';
import LanguageIcon from '../../icons/language.svg';
import styles from './BotPreview.module.css';
import settingsStyles from '../team/Settings.module.css';

const LanguageSettings = ({
  isAdmin,
  languageDetection,
  onChangeLanguageDetection,
  onChangeSendArticlesInSameLanguage,
  sendArticlesInSameLanguage,
}) => (
  <div className={styles['settings-card']}>
    <div className={styles['settings-card-header']}>
      <LanguageIcon />
      <span>Language</span>
    </div>
    <div className={settingsStyles['setting-content-container']}>
      <SwitchComponent
        checked={languageDetection}
        disabled={!isAdmin}
        label={
          <FormattedMessage
            defaultMessage="Enable language detection"
            description="Label for a switch where the user toggles auto language detection"
            id="languagesComponent.languageDetectionSwitch"
          />
        }
        onChange={() => onChangeLanguageDetection(!languageDetection)}
      />
      <Alert
        content={
          languageDetection ?
            <FormattedMessage
              defaultMessage="The Check Tipline bot will automatically recognize and respond in the language of your user's request."
              description="Instructions for the language detection toggle switch when enabled"
              id="languagesComponent.enabledDescription"
            />
            :
            <FormattedMessage
              defaultMessage="When enabled the Check Tipline bot will automatically recognize and respond in the language of your user's request."
              description="Instructions for the language detection toggle switch when disabled"
              id="languageSettings.disabledDescription"
            />
        }
        icon
        variant="info"
      />
    </div>
    <div className={settingsStyles['setting-content-container']}>
      <SwitchComponent
        checked={sendArticlesInSameLanguage}
        disabled={!isAdmin}
        label={
          <FormattedMessage
            defaultMessage="Send articles in the same language as the conversation"
            description="Label for a switch where the user toggles sending articles in the same language as the conversation"
            id="languageSettings.sendArticlesInSameLanguage"
          />
        }
        onChange={() => onChangeSendArticlesInSameLanguage(!sendArticlesInSameLanguage)}
      />
      <Alert
        content={
          sendArticlesInSameLanguage ?
            <FormattedMessage
              defaultMessage="Articles will only be sent to users whose chosen language of conversation in the tipline matches the article language."
              description="Instructions for the 'Send articles in the same language as the conversation' toggle switch when enabled"
              id="languageSettings.sendArticlesInSameLanguageEnabledDescription"
            />
            :
            <FormattedMessage
              defaultMessage="When enabled articles will only be sent to users whose chosen  language of conversation in the tipline matches the article language."
              description="Instructions for the 'Send articles in the same language as the conversation' toggle switch when disabled"
              id="languageSettings.sendArticlesInSameLanguageDisabledDescription"
            />
        }
        icon
        variant="info"
      />
    </div>
  </div>
);

export default LanguageSettings;
