import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames/bind';
import TextField from '../../cds/inputs/TextField';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import ConfirmProceedDialog from '../../layout/ConfirmProceedDialog';
import { languageLabel } from '../../../LanguageRegistry';
import { FormattedGlobalMessage } from '../../MappedMessage';
import StatusLabel from './StatusLabel';
import StatusMessage from './StatusMessage';
import styles from './Statuses.module.css';
import settingsStyles from '../Settings.module.css';

const TranslateStatuses = ({
  statuses,
  defaultLanguage,
  currentLanguage,
  onSubmit,
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
            variant="contained"
            theme="brand"
            size="default"
            onClick={handleSave}
            label={
              <FormattedGlobalMessage messageKey="save" />
            }
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
              label={
                <FormattedMessage
                  id="translateStatuses.status"
                  defaultMessage="Status"
                  description="Label for TextField for the status translation"
                />
              }
              defaultValue={
                s.locales[currentLanguage] ?
                  s.locales[currentLanguage].label : ''
              }
              id={`translate-statuses__input-${s.id}`}
              onChange={e => (handleTextChange(s.id, e.target.value))}
              variant="outlined"
            />
            { s.should_send_message && s.locales[defaultLanguage] && s.locales[defaultLanguage].message ?
              <TextField
                className="translate-statuses__message"
                label={
                  <FormattedMessage
                    id="translateStatuses.message"
                    defaultMessage="Message"
                    description="Label for the textarea where user can provide a translation for the automated message"
                  />
                }
                defaultValue={
                  s.locales[currentLanguage] ?
                    s.locales[currentLanguage].message : ''
                }
                id={`translate-statuses__message-${s.id}`}
                rows={3}
                rowsMax={Infinity}
                onChange={e => (handleMessageChange(s.id, e.target.value))}
                variant="outlined"
              /> : null }
          </div>
        </div>
      ))}
      <ConfirmProceedDialog
        open={showWarning}
        title={
          <FormattedMessage
            id="translateStatuses.missingTranslations"
            defaultMessage="Missing translations"
            description="Modal Title informing the user that there are missing translations"
          />
        }
        body={
          <div>
            <FormattedMessage
              tagName="p"
              id="translateStatuses.missingTranslationsBody"
              defaultMessage="Some statuses are missing translations. Users may not be able to read untranslated statuses."
              description="Modal paragraph description informing the user that there are missing translations"
            />
            <FormattedMessage
              tagName="p"
              id="translateStatuses.missingTranslationsBody2"
              defaultMessage="If the message for a status is not translated in a language, any requester using that language will not receive the message."
              description="Description paragraph telling the user what will happen is a translation is missing"
            />
          </div>
        }
        onCancel={handleDialogCancel}
        onProceed={handleSubmit}
        proceedLabel={
          <FormattedMessage
            id="translateStatuses.continueAndSave"
            defaultMessage="Continue and save"
            description="Label for confirmation to save the updated status translations"
          />
        }
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
