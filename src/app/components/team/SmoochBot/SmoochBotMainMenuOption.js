import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import ListSubheader from '@material-ui/core/ListSubheader';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import ConfirmProceedDialog from '../../layout/ConfirmProceedDialog';

const SmoochBotMainMenuOption = ({
  currentTitle,
  currentDescription,
  currentValue,
  resources,
  onSave,
  onCancel,
}) => {
  const [text, setText] = React.useState(currentTitle);
  const [description, setDescription] = React.useState(currentDescription);
  const [value, setValue] = React.useState(currentValue);

  const handleSave = () => {
    onSave(text, description, value);
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
          defaultMessage="Scenario"
          description="Title of dialog that opens to add a new option to tipline bot main menu"
        />
      }
      body={(
        <Box>
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
            inputProps={{ maxLength: 24 }}
            variant="outlined"
            fullWidth
          />

          <Box my={2}>
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
              inputProps={{ maxLength: 72 }}
              variant="outlined"
              fullWidth
            />
          </Box>

          <Box my={2}>
            <Typography variant="body2" component="div">
              <FormattedMessage
                id="smoochBotMainMenuOption.send"
                defaultMessage="If the button is clicked, then send:"
                description="Disclaimer displayed on dialog that opens to add a new option to tipline bot main menu"
              />
            </Typography>
          </Box>

          <FormControl variant="outlined" fullWidth>
            <InputLabel>
              <FormattedMessage
                id="smoochBotMainMenuOption.response"
                defaultMessage="Response"
                description="Input label displayed on dialog that opens to add a new option to tipline bot main menu"
              />
            </InputLabel>
            <Select
              value={value}
              label={
                <FormattedMessage
                  id="smoochBotMainMenuOption.response"
                  defaultMessage="Response"
                  description="Input label displayed on dialog that opens to add a new option to tipline bot main menu"
                />
              }
              onChange={(e) => { setValue(e.target.value); }}
            >
              <MenuItem value="" disabled>
                <FormattedMessage
                  id="smoochBotMainMenuOption.selectAction"
                  defaultMessage="Select action"
                  description="Input label displayed on dialog that opens to add a new option to tipline bot main menu"
                />
              </MenuItem>
              <ListSubheader>
                <FormattedMessage
                  id="smoochBotMainMenuOption.main"
                  defaultMessage="Main"
                  description="List subheader displayed on dialog that opens to add a new option to tipline bot main menu"
                />
              </ListSubheader>
              <MenuItem value="query_state">
                <FormattedMessage
                  id="smoochBotMainMenuOption.queryState"
                  defaultMessage="Submission prompt"
                  description="Menu option displayed on dialog that opens to add a new option to tipline bot main menu"
                />
              </MenuItem>
              <MenuItem value="subscription_state">
                <FormattedMessage
                  id="smoochBotMainMenuOption.subscriptionState"
                  defaultMessage="Subscription opt-in"
                  description="Menu option displayed on dialog that opens to add a new option to tipline bot main menu"
                />
              </MenuItem>
              <ListSubheader>
                <FormattedMessage
                  id="smoochBotMainMenuOption.resources"
                  defaultMessage="Resources"
                  description="List subheader displayed on dialog that opens to add a new option to tipline bot main menu"
                />
              </ListSubheader>
              { resources.map(resource => (
                <MenuItem value={resource.smooch_custom_resource_id} key={resource.smooch_custom_resource_id}>
                  {resource.smooch_custom_resource_title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
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

export default SmoochBotMainMenuOption;
