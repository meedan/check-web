import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import cx from 'classnames/bind';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import TextField from '@material-ui/core/TextField';
import CancelIcon from '../../../icons/cancel.svg';
import EditIcon from '../../../icons/edit.svg';
import LockIcon from '../../../icons/lock.svg';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import SmoochBotMainMenuOption from './SmoochBotMainMenuOption';
import ConfirmProceedDialog from '../../layout/ConfirmProceedDialog';
import Reorder from '../../layout/Reorder';
import AddIcon from '../../../icons/add.svg';

const useStyles = makeStyles(theme => ({
  box: {
    background: 'var(--brandBackground)',
    borderRadius: theme.spacing(1),
  },
  textField: {
    background: 'var(--otherWhite)',
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  title: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  lock: {
    color: 'var(--textSecondary)',
    fontSize: '20px',
  },
  noDescription: {
    fontStyle: 'italic',
  },
}));

const SmoochBotMainMenuSection = ({
  number,
  value,
  resources,
  readOnly,
  optional,
  noTitleNoDescription,
  canCreate,
  onChangeTitle,
  onChangeMenuOptions,
}) => {
  const classes = useStyles();
  const [showNewOptionDialog, setShowNewOptionDialog] = React.useState(false);
  const [editingOptionIndex, setEditingOptionIndex] = React.useState(-1);
  const [showErrorDialog, setShowErrorDialog] = React.useState(false);

  const options = value.smooch_menu_options || [];

  const handleAddNewOption = () => {
    if (canCreate) {
      setShowNewOptionDialog(true);
    } else {
      setShowErrorDialog(true);
    }
  };

  const handleEditOption = (optionIndex) => {
    setEditingOptionIndex(optionIndex);
  };

  const handleDeleteOption = (optionIndex) => {
    const newOptions = options.slice();
    newOptions.splice(optionIndex, 1);
    onChangeMenuOptions(newOptions);
  };

  const handleCancel = () => {
    setShowNewOptionDialog(false);
    setEditingOptionIndex(-1);
  };

  const buildOption = (label, description, action) => {
    // If it's a sequence of digits, then it represents a resource
    if (/^[0-9]+$/.test(action)) {
      return {
        smooch_menu_option_keyword: action,
        smooch_menu_option_value: 'custom_resource',
        smooch_menu_custom_resource_id: action,
        smooch_menu_option_label: label,
        smooch_menu_option_description: description,
        smooch_menu_project_media_title: '',
        smooch_menu_project_media_id: '',
      };
    }
    return {
      smooch_menu_option_keyword: action,
      smooch_menu_option_value: action,
      smooch_menu_option_label: label,
      smooch_menu_option_description: description,
      smooch_menu_project_media_title: '',
      smooch_menu_project_media_id: '',
    };
  };

  const handleSaveNewOption = (label, description, action) => {
    const newOption = buildOption(label, description, action);
    const newOptions = options.slice();
    newOptions.push(newOption);
    onChangeMenuOptions(newOptions);
    setShowNewOptionDialog(false);
  };

  const handleSaveOption = (label, description, action) => {
    const newOption = buildOption(label, description, action);
    const newOptions = options.slice();
    newOptions[editingOptionIndex] = newOption;
    onChangeMenuOptions(newOptions);
    setEditingOptionIndex(-1);
  };

  const handleMoveUp = (optionIndex) => {
    if (optionIndex > 0) {
      const newOptions = options.slice();
      const tmp = newOptions[optionIndex - 1];
      newOptions[optionIndex - 1] = newOptions[optionIndex];
      newOptions[optionIndex] = tmp;
      onChangeMenuOptions(newOptions);
    }
  };

  const handleMoveDown = (optionIndex) => {
    if (optionIndex < options.length - 1) {
      const newOptions = options.slice();
      const tmp = newOptions[optionIndex + 1];
      newOptions[optionIndex + 1] = newOptions[optionIndex];
      newOptions[optionIndex] = tmp;
      onChangeMenuOptions(newOptions);
    }
  };

  const formatOptionLabel = (option) => {
    if (option.smooch_menu_option_label) {
      return option.smooch_menu_option_label;
    }
    if (option.smooch_menu_option_value === 'custom_resource') {
      const resource = resources.find(r => r.uuid === option.smooch_menu_custom_resource_id);
      if (resource) {
        return resource.smooch_custom_resource_title;
      }
    }
    return option.smooch_menu_option_value;
  };

  return (
    <Box className={classes.box} my={2}>
      <Box display="flex" alignItems="center" justifyContent="space-between" p={1}>
        <Box display="flex" alignItems="center" pt={1} pb={1}>

          {/* Title */}
          { readOnly ?
            <Box pt={1} pb={1}>
              <div className={cx('typography-body1', classes.title)}>
                <strong>
                  {value.smooch_menu_title}
                </strong>
              </div>
            </Box> : null }
          { noTitleNoDescription ?
            <Box p={1}>
              <div className={cx('typography-body1', classes.title)}>
                <strong>
                  <FormattedMessage
                    id="smoochBotMainMenuSection.defaultSectionTitle"
                    defaultMessage="Menu options"
                    description="Default label for a main menu section title field on tipline bot settings."
                  />
                </strong>
              </div>
            </Box> : null }
          { !readOnly && !noTitleNoDescription ?
            <TextField
              key={`title-${number}`}
              className={classes.textField}
              label={
                <FormattedMessage
                  id="smoochBotMainMenuSection.sectionTitle"
                  defaultMessage="Title - 24 characters limit"
                  description="Label for a main menu section title field on tipline bot settings."
                />
              }
              variant="outlined"
              inputProps={{
                size: 24,
                minLength: 1,
                maxLength: 24,
                required: true,
              }}
              size="small"
              disabled={readOnly}
              onBlur={(e) => { onChangeTitle(e.target.value); }}
              defaultValue={value.smooch_menu_title}
              error={options.length > 0 && !value.smooch_menu_title}
            /> : null }
        </Box>

        {/* Add a new menu option */}
        <Box pr={1}>
          <ButtonMain
            theme="brand"
            variant="text"
            size="default"
            disabled={readOnly}
            onClick={handleAddNewOption}
            iconLeft={<AddIcon />}
            label={
              <FormattedMessage
                id="smoochBotMainMenuSection.newOption"
                defaultMessage="New option"
                description="Button label to create a new main menu option on tipline bot settings."
              />
            }
          />
        </Box>
      </Box>

      <Divider />

      {/* No options */}
      { options.length === 0 ?
        <Box pl={2} pt={2}>
          <FormattedMessage
            id="smoochBotMainMenuSection.noOptions"
            defaultMessage="There is currently no option in this section."
            description="Message displayed when there is no menu option on tipline bot settings."
          />
        </Box> : null }

      {/* Each menu option */}
      <Box p={1}>
        { options.map((option, i) => (
          <Box display="flex" alignItems="center" justifyContent="space-between" my={1} key={formatOptionLabel(option)}>

            {/* Menu option label and reordering */}
            <Box display="flex" alignItems="center" style={{ gap: '10px' }}>
              { !readOnly &&
                <Reorder
                  variant="horizontal"
                  theme="white"
                  onMoveUp={() => { handleMoveUp(i); }}
                  onMoveDown={() => { handleMoveDown(i); }}
                  disableUp={i === 0}
                  disableDown={i === options.length - 1}
                />
              }
              <Box m={readOnly ? 1 : 0}>
                {/* Menu option label */}
                <div className="typography-body1">
                  <strong>{formatOptionLabel(option)}</strong>
                </div>

                {/* Menu option description */}
                <div className="typography-caption">
                  { !readOnly && !option.smooch_menu_option_description ?
                    <span className={classes.noDescription}>
                      <FormattedMessage
                        id="smoochBotMainMenuSection.optionNoDescription"
                        defaultMessage="no description"
                        description="Displayed when a tipline bot menu option doesn't have a description."
                      />
                    </span> : option.smooch_menu_option_description }
                </div>
              </Box>
            </Box>

            {/* Menu option buttons: edit and delete */}
            <Box display="flex" alignItems="center">

              {/* Edit */}
              { readOnly ?
                null :
                <ButtonMain
                  iconCenter={<EditIcon />}
                  variant="text"
                  theme="lightText"
                  size="default"
                  disabled={readOnly}
                  onClick={() => { handleEditOption(i); }}
                />
              }
              {' '}

              {/* Delete */}
              { readOnly || (!optional && options.length === 1) ?
                null :
                <ButtonMain
                  iconCenter={<CancelIcon />}
                  variant="text"
                  theme="lightText"
                  size="default"
                  onClick={() => { handleDeleteOption(i); }}
                />

              }

              {/* Locked */}
              { readOnly || (!optional && options.length === 1) ? <LockIcon className={classes.lock} /> : null }
            </Box>
          </Box>
        ))}
      </Box>

      {/* Dialog: Add new option */}
      { showNewOptionDialog ?
        <SmoochBotMainMenuOption resources={resources} onSave={handleSaveNewOption} onCancel={handleCancel} /> : null }

      {/* Dialog: Edit option */}
      { editingOptionIndex > -1 ?
        <SmoochBotMainMenuOption
          resources={resources}
          currentTitle={options[editingOptionIndex].smooch_menu_option_label}
          currentDescription={options[editingOptionIndex].smooch_menu_option_description}
          currentValue={options[editingOptionIndex].smooch_menu_option_value === 'custom_resource' ? options[editingOptionIndex].smooch_menu_custom_resource_id : options[editingOptionIndex].smooch_menu_option_value}
          onSave={handleSaveOption}
          onCancel={handleCancel}
        /> : null }

      {/* Dialog: Can't add more menu options */}
      <ConfirmProceedDialog
        open={showErrorDialog}
        title={
          <FormattedMessage
            id="smoochBotMainMenuSection.maxOptionsReachedTitle"
            defaultMessage="Maximum menu options"
            description="Title of a dialog that is displayed when user tries to add a new option to the tipline bot menu but the maximum number of options was reached."
          />
        }
        body={
          <div>
            <p className="typography-body1">
              <FormattedMessage
                id="smoochBotMainMenuSection.maxOptionsReachedDescription"
                defaultMessage="The maximum number of options in the main menu is 10."
                description="Text of a dialog that is displayed when user tries to add a new option to the tipline bot menu but the maximum number of options was reached."
              />
            </p>
          </div>
        }
        proceedLabel={
          <FormattedMessage
            id="smoochBotMainMenuSection.maxOptionsReachedLabel"
            defaultMessage="Go back"
            description="A label on a button that the user can press to go back to the screen where they edit the tipline bot menu options."
          />
        }
        onProceed={() => { setShowErrorDialog(false); }}
        onCancel={() => { setShowErrorDialog(false); }}
      />
    </Box>
  );
};

SmoochBotMainMenuSection.defaultProps = {
  value: {},
  resources: [],
  readOnly: false,
  optional: false,
  noTitleNoDescription: false,
  canCreate: true,
};

SmoochBotMainMenuSection.propTypes = {
  number: PropTypes.number.isRequired,
  value: PropTypes.object,
  resources: PropTypes.arrayOf(PropTypes.object),
  readOnly: PropTypes.bool,
  optional: PropTypes.bool,
  noTitleNoDescription: PropTypes.bool,
  canCreate: PropTypes.bool,
  onChangeTitle: PropTypes.func.isRequired,
  onChangeMenuOptions: PropTypes.func.isRequired,
};

export default SmoochBotMainMenuSection;
