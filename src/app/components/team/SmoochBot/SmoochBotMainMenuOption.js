import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import Select from '../../cds/inputs/Select';
import TextField from '../../cds/inputs/TextField';
import ConfirmProceedDialog from '../../layout/ConfirmProceedDialog';

const SmoochBotMainMenuOption = ({
  currentTitle,
  currentDescription,
  currentValue,
  resources,
  onSave,
  onCancel,
  intl,
}) => {
  const [text, setText] = React.useState(currentTitle);
  const [description, setDescription] = React.useState(currentDescription);
  const [value, setValue] = React.useState(currentValue);
  const [submitted, setSubmitted] = React.useState(false);

  const handleSave = () => {
    setSubmitted(true);
    if (text && value) {
      onSave(text, description, value);
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
          <p>
            <TextField
              label={
                <FormattedMessage
                  id="smoochBotMainMenuOption.label"
                  defaultMessage="Button text - 24 characters limit"
                  description="Text field label on dialog that opens to add a new option to tipline bot main menu"
                />
              }
              defaultValue={text}
              onBlur={(e) => { setText(e.target.value); }}
              componentProps={{ maxLength: 24 }}
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
          </p>
          <p>
            <TextField
              label={
                <FormattedMessage
                  id="smoochBotMainMenuOption.description"
                  defaultMessage="Description - 72 characters limit"
                  description="Description field label on dialog that opens to add a new option to tipline bot main menu"
                />
              }
              defaultValue={description}
              onBlur={(e) => { setDescription(e.target.value); }}
              componentProps={{ maxLength: 72 }}
              variant="contained"
            />
          </p>
          <p className="typography-body1">
            <FormattedMessage
              id="smoochBotMainMenuOption.send"
              defaultMessage="If the button is clicked, then send:"
              description="Disclaimer displayed on dialog that opens to add a new option to tipline bot main menu"
            />
          </p>
          <p>
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
          </p>
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
  currentTitle: '',
  currentDescription: '',
  currentValue: null,
  resources: [],
};

SmoochBotMainMenuOption.propTypes = {
  currentTitle: PropTypes.string,
  currentDescription: PropTypes.string,
  currentValue: PropTypes.string,
  resources: PropTypes.arrayOf(PropTypes.object),
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default injectIntl(SmoochBotMainMenuOption);
