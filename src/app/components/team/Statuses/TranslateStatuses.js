/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames/bind';
import StatusLabel from './StatusLabel';
import StatusMessage from './StatusMessage';
import TextField from '../../cds/inputs/TextField';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import ConfirmProceedDialog from '../../layout/ConfirmProceedDialog';
import { languageLabel } from '../../../LanguageRegistry';
import { FormattedGlobalMessage } from '../../MappedMessage';
import styles from './Statuses.module.css';
import settingsStyles from '../Settings.module.css';

const TranslateStatuses = ({
  currentLanguage,
  defaultLanguage,
  onSubmit,
  statuses,
}) => {
  const [translations, setTranslations] = React.useState({});
  const [messages, setMessages] = React.useState({});
  const [showWarning, setShowWarning] = React.useState(false);

  const handleDialogCancel = () => {
    setShowWarning(false);
  };

  const handleSubmit = () => {
    const newStatusesArray = statuses.map((s) => {
      const status = { ...s };
      const locales = { ...s.locales };

      let label = translations[s.id];
      let message = messages[s.id];

      if (typeof label === 'undefined' && s.locales[currentLanguage]) {
        label = s.locales[currentLanguage].label || '';
      }

      if (typeof message === 'undefined' && s.locales[currentLanguage]) {
        message = s.locales[currentLanguage].message || '';
      }

      locales[currentLanguage] = {
        label,
        message,
        description: '',
      };
      status.locales = locales;

      return status;
    });

    setShowWarning(false);
    onSubmit(newStatusesArray);
  };

  const handleSave = () => {
    const missingTranslation = statuses.some((s) => {
      const savedTranslation =
        s.locales[currentLanguage] &&
        s.locales[currentLanguage].label;
      const newTranslation = translations[s.id];
      return (!savedTranslation && !newTranslation);
    });

    const missingMessage = statuses.some((s) => {
      const missedMessage =
        s.should_send_message &&
        s.locales[defaultLanguage] &&
        s.locales[defaultLanguage].message &&
        s.locales[defaultLanguage].message.length > 0 &&
        (!s.locales[currentLanguage] || !s.locales[currentLanguage].message || s.locales[currentLanguage].message.replace(/\s/g, '').length === 0);
      const newMessage = messages[s.id];
      return (missedMessage && !newMessage);
    });

    if (missingTranslation || missingMessage) {
      setShowWarning(true);
    } else {
      handleSubmit();
    }
  };

  const handleTextChange = (id, text) => {
    const newTranslations = { ...translations, [id]: text };
    setTranslations(newTranslations);
  };

  const handleMessageChange = (id, message) => {
    const newMessages = { ...messages, [id]: message };
    setMessages(newMessages);
  };

  return (
    <div className={styles['settings-translated-statuses']}>
      <div className={cx(styles['settings-translated-rows'], styles['settings-translated-row-header'])}>
        <div className="typography-button">
          { languageLabel(defaultLanguage) }
        </div>
        <div>
          <span className="typography-button">
            { languageLabel(currentLanguage) }
          </span>
          <ButtonMain
            className="translate-statuses__save"
            label={
              <FormattedGlobalMessage messageKey="save" />
            }
            size="default"
            theme="info"
            variant="contained"
            onClick={handleSave}
          />
        </div>
      </div>
      {statuses.map(s => (
        <div className={styles['settings-translated-rows']} key={s.id}>
          <div>
            <ul className={settingsStyles['setting-content-list']}>
              <li>
                <div>
                  <StatusLabel color={s.style.color}>
                    { s.locales[defaultLanguage] ?
                      s.locales[defaultLanguage].label : s.label }
                  </StatusLabel>
                  <StatusMessage
                    message={
                      s.locales[defaultLanguage] && s.should_send_message ?
                        s.locales[defaultLanguage].message : null
                    }
                  />
                </div>
              </li>
            </ul>
          </div>
          <div>
            <TextField
              className="translate-statuses__input"
              defaultValue={
                s.locales[currentLanguage] ?
                  s.locales[currentLanguage].label : ''
              }
              id={`translate-statuses__input-${s.id}`}
              label={
                <FormattedMessage
                  defaultMessage="Status"
                  description="Label for TextField for the status translation"
                  id="translateStatuses.status"
                />
              }
              variant="outlined"
              onChange={e => (handleTextChange(s.id, e.target.value))}
            />
            { s.should_send_message && s.locales[defaultLanguage] && s.locales[defaultLanguage].message ?
              <TextField
                className="translate-statuses__message"
                defaultValue={
                  s.locales[currentLanguage] ?
                    s.locales[currentLanguage].message : ''
                }
                id={`translate-statuses__message-${s.id}`}
                label={
                  <FormattedMessage
                    defaultMessage="Message"
                    description="Label for the textarea where user can provide a translation for the automated message"
                    id="translateStatuses.message"
                  />
                }
                rows={3}
                rowsMax={Infinity}
                variant="outlined"
                onChange={e => (handleMessageChange(s.id, e.target.value))}
              /> : null }
          </div>
        </div>
      ))}
      <ConfirmProceedDialog
        body={
          <div>
            <FormattedMessage
              defaultMessage="Some statuses are missing translations. Users may not be able to read untranslated statuses."
              description="Modal paragraph description informing the user that there are missing translations"
              id="translateStatuses.missingTranslationsBody"
              tagName="p"
            />
            <FormattedMessage
              defaultMessage="If the message for a status is not translated in a language, any requester using that language will not receive the message."
              description="Description paragraph telling the user what will happen is a translation is missing"
              id="translateStatuses.missingTranslationsBody2"
              tagName="p"
            />
          </div>
        }
        open={showWarning}
        proceedLabel={
          <FormattedMessage
            defaultMessage="Continue and save"
            description="Label for confirmation to save the updated status translations"
            id="translateStatuses.continueAndSave"
          />
        }
        title={
          <FormattedMessage
            defaultMessage="Missing translations"
            description="Modal Title informing the user that there are missing translations"
            id="translateStatuses.missingTranslations"
          />
        }
        onCancel={handleDialogCancel}
        onProceed={handleSubmit}
      />
    </div>
  );
};

TranslateStatuses.propTypes = {
  statuses: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  }).isRequired).isRequired,
  defaultLanguage: PropTypes.string.isRequired,
  currentLanguage: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default TranslateStatuses;
