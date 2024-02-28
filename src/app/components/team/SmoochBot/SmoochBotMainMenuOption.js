import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import Select from '../../cds/inputs/Select';
import LimitedTextArea from '../../layout/inputs/LimitedTextArea';
import ConfirmProceedDialog from '../../layout/ConfirmProceedDialog';
import SmoochBotMenuKeywords from './SmoochBotMenuKeywords';

const SmoochBotMainMenuOption = ({
  currentTitle,
  currentDescription,
  currentValue,
  currentUser,
  currentKeywords,
  currentLanguage,
  menu,
  index,
  resources,
  hasUnsavedChanges,
  onSave,
  onCancel,
  intl,
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
      open
      title={
        <FormattedMessage
          id="smoochBotMainMenuOption.scenario"
          defaultMessage="Menu Option"
          description="Title of dialog that opens to add a new option to tipline bot main menu"
        />
      }
      body={(
        <>
          <LimitedTextArea
            label={
              <FormattedMessage
                id="smoochBotMainMenuOption.label"
                defaultMessage="Button text"
                description="Text field label on dialog that opens to add a new option to tipline bot main menu"
              />
            }
            value={text}
            onBlur={(e) => { setText(e.target.value); }}
            maxChars={24}
            variant="contained"
            error={submitted && !text}
            required
            helpContent={
              submitted && !text ?
                <FormattedMessage
                  id="smoochBotMainMenuOption.labelError"
                  defaultMessage="Please add text to label the button"
                  description="Error message displayed when user tries to save tipline menu option with a blank label"
                /> : null
            }
          />
          <br />
          <LimitedTextArea
            label={
              <FormattedMessage
                id="smoochBotMainMenuOption.description"
                defaultMessage="Description"
                description="Description field label on dialog that opens to add a new option to tipline bot main menu"
              />
            }
            value={description}
            onBlur={(e) => { setDescription(e.target.value); }}
            maxChars={72}
            variant="contained"
          />
          <br />
          <SmoochBotMenuKeywords
            keywords={currentKeywords}
            currentUser={currentUser}
            menu={menu}
            currentLanguage={currentLanguage}
            index={index}
            hasUnsavedChanges={hasUnsavedChanges}
            onUpdateKeywords={() => { setKeywordsUpdated(true); }}
          />
          <br />
          <FormattedMessage
            tagName="p"
            id="smoochBotMainMenuOption.send"
            defaultMessage="If the button is clicked, then send:"
            description="Disclaimer displayed on dialog that opens to add a new option to tipline bot main menu"
          />
          <Select
            value={value}
            required
            error={submitted && !value}
            helpContent={
              (submitted && !value) ?
                <FormattedMessage
                  id="smoochBotMainMenuOption.responseError"
                  defaultMessage="Please choose a response"
                  description="Error message displayed when user tries to save tipline option with empty response"
                /> : null
            }
            label={
              <FormattedMessage
                id="smoochBotMainMenuOption.response"
                defaultMessage="Response"
                description="Input label displayed on dialog that opens to add a new option to tipline bot main menu"
              />
            }
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
                <option value={resource.uuid} key={resource.uuid}>
                  {resource.title}
                </option>
              ))}
            </optgroup>
          </Select>
        </>
      )}
      proceedLabel={<FormattedMessage id="smoochBotMainMenuOption.save" defaultMessage="Save" description="Button label to save new tipline menu option" />}
      onProceed={handleSave}
      cancelLabel={<FormattedMessage id="smoochBotMainMenuOption.cancel" defaultMessage="Cancel" description="Button label to cancel adding a new tipline menu option" />}
      onCancel={handleCancel}
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
  hasUnsavedChanges: PropTypes.bool,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default injectIntl(SmoochBotMainMenuOption);
