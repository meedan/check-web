/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import SmoochBotMenuKeywords from './SmoochBotMenuKeywords';
import Select from '../../cds/inputs/Select';
import LimitedTextArea from '../../layout/inputs/LimitedTextArea';
import ConfirmProceedDialog from '../../layout/ConfirmProceedDialog';

const SmoochBotMainMenuOption = ({
  currentDescription,
  currentKeywords,
  currentLanguage,
  currentTitle,
  currentUser,
  currentValue,
  hasUnsavedChanges,
  id,
  index,
  intl,
  menu,
  onCancel,
  onSave,
  resources,
}) => {
  const [text, setText] = React.useState(currentTitle);
  const [description, setDescription] = React.useState(currentDescription);
  const [value, setValue] = React.useState(currentValue);
  const [submitted, setSubmitted] = React.useState(false);
  const [keywordsUpdated, setKeywordsUpdated] = React.useState(false);

  const handleSave = () => {
    setSubmitted(true);
    if (text && value) {
      onSave(text, description, value, id, currentKeywords);
    }
    if (keywordsUpdated) {
      // Reload the page so settings are refreshed
      // This is necessary because keywords are updated using Relay Modern and tipline settings are still using Relay classic, so they don't share the same store
      window.location.reload();
    }
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <ConfirmProceedDialog
      body={(
        <>
          <LimitedTextArea
            error={submitted && !text}
            helpContent={
              submitted && !text ?
                <FormattedMessage
                  defaultMessage="Please add text to label the button"
                  description="Error message displayed when user tries to save tipline menu option with a blank label"
                  id="smoochBotMainMenuOption.labelError"
                /> : null
            }
            label={
              <FormattedMessage
                defaultMessage="Button text"
                description="Text field label on dialog that opens to add a new option to tipline bot main menu"
                id="smoochBotMainMenuOption.label"
              />
            }
            maxChars={24}
            required
            value={text}
            variant="contained"
            onBlur={(e) => { setText(e.target.value); }}
          />
          <br />
          <LimitedTextArea
            label={
              <FormattedMessage
                defaultMessage="Description"
                description="Description field label on dialog that opens to add a new option to tipline bot main menu"
                id="smoochBotMainMenuOption.description"
              />
            }
            maxChars={72}
            value={description}
            variant="contained"
            onBlur={(e) => { setDescription(e.target.value); }}
          />
          <br />
          <SmoochBotMenuKeywords
            currentLanguage={currentLanguage}
            currentUser={currentUser}
            hasUnsavedChanges={hasUnsavedChanges}
            index={index}
            keywords={currentKeywords}
            menu={menu}
            onUpdateKeywords={() => { setKeywordsUpdated(true); }}
          />
          <br />
          <FormattedMessage
            defaultMessage="If the button is clicked, then send:"
            description="Disclaimer displayed on dialog that opens to add a new option to tipline bot main menu"
            id="smoochBotMainMenuOption.send"
            tagName="p"
          />
          <Select
            error={submitted && !value}
            helpContent={
              (submitted && !value) ?
                <FormattedMessage
                  defaultMessage="Please choose a response"
                  description="Error message displayed when user tries to save tipline option with empty response"
                  id="smoochBotMainMenuOption.responseError"
                /> : null
            }
            label={
              <FormattedMessage
                defaultMessage="Response"
                description="Input label displayed on dialog that opens to add a new option to tipline bot main menu"
                id="smoochBotMainMenuOption.response"
              />
            }
            required
            value={value}
            onChange={(e) => { setValue(e.target.value); }}
          >
            <option hidden>
              {intl.formatMessage({
                id: 'smoochBotMainMenuOption.selectAction',
                defaultMessage: 'Select action...',
                description: 'Input label displayed on dialog that opens to add a new option to tipline bot main menu',
              })}
            </option>
            <optgroup
              label={intl.formatMessage({
                id: 'smoochBotMainMenuOption.main',
                defaultMessage: 'Main',
                description: 'List subheader displayed on dialog that opens to add a new option to tipline bot main menu',
              })}
            >
              <option value="query_state">
                {intl.formatMessage({
                  id: 'smoochBotMainMenuOption.queryState',
                  defaultMessage: 'Submission prompt',
                  description: 'Menu option displayed on dialog that opens to add a new option to tipline bot main menu',
                })}
              </option>
              <option value="subscription_state">
                {intl.formatMessage({
                  id: 'smoochBotMainMenuOption.subscriptionState',
                  defaultMessage: 'Subscription opt-in',
                  description: 'Menu option displayed on dialog that opens to add a new option to tipline bot main menu',
                })}
              </option>
            </optgroup>
            <optgroup
              label={intl.formatMessage({
                id: 'smoochBotMainMenuOption.resources',
                defaultMessage: 'Resources',
                description: 'List subheader displayed on dialog that opens to add a new option to tipline bot main menu',
              })}
            >
              { resources.map(resource => (
                <option key={resource.uuid} value={resource.uuid}>
                  {resource.title}
                </option>
              ))}
            </optgroup>
          </Select>
        </>
      )}
      cancelLabel={<FormattedMessage defaultMessage="Cancel" description="Button label to cancel adding a new tipline menu option" id="smoochBotMainMenuOption.cancel" />}
      open
      proceedLabel={<FormattedMessage defaultMessage="Save" description="Button label to save new tipline menu option" id="smoochBotMainMenuOption.save" />}
      title={
        <FormattedMessage
          defaultMessage="Menu Option"
          description="Title of dialog that opens to add a new option to tipline bot main menu"
          id="smoochBotMainMenuOption.scenario"
        />
      }
      onCancel={handleCancel}
      onProceed={handleSave}
    />
  );
};

SmoochBotMainMenuOption.defaultProps = {
  resources: [],
  currentTitle: '',
  currentDescription: '',
  currentValue: null,
  currentUser: null,
  currentLanguage: null,
  currentKeywords: [],
  index: null,
  id: '',
  hasUnsavedChanges: false,
};

SmoochBotMainMenuOption.propTypes = {
  resources: PropTypes.arrayOf(PropTypes.object),
  currentTitle: PropTypes.string,
  currentDescription: PropTypes.string,
  currentValue: PropTypes.string,
  currentUser: PropTypes.shape({ is_admin: PropTypes.bool.isRequired }),
  currentKeywords: PropTypes.arrayOf(PropTypes.string),
  currentLanguage: PropTypes.string,
  menu: PropTypes.oneOf(['main', 'secondary']).isRequired,
  index: PropTypes.number,
  id: PropTypes.string,
  hasUnsavedChanges: PropTypes.bool,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default injectIntl(SmoochBotMainMenuOption);
