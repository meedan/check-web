import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames/bind';
import SmoochBotMainMenuOption from './SmoochBotMainMenuOption';
import TextField from '../../cds/inputs/TextField';
import Tooltip from '../../cds/alerts-and-prompts/Tooltip';
import CancelIcon from '../../../icons/cancel.svg';
import EditIcon from '../../../icons/edit.svg';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import ConfirmProceedDialog from '../../layout/ConfirmProceedDialog';
import Reorder from '../../layout/Reorder';
import AddIcon from '../../../icons/add.svg';
import styles from '../Settings.module.css';

const SmoochBotMainMenuSection = ({
  canCreate,
  currentLanguage,
  currentUser,
  hasUnsavedChanges,
  noTitleNoDescription,
  number,
  onChangeMenuOptions,
  onChangeTitle,
  optional,
  readOnly,
  resources,
  value,
}) => {
  const [showNewOptionDialog, setShowNewOptionDialog] = React.useState(false);
  const [editingOptionIndex, setEditingOptionIndex] = React.useState(-1);
  const [showErrorDialog, setShowErrorDialog] = React.useState(false);

  const options = value.smooch_menu_options || [];
  const menu = { 1: 'main', 2: 'secondary' }[number];

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

  const buildOption = (label, description, action, id, keywords) => {
    // If it's a sequence of digits, then it represents a resource
    if (/^[0-9]+$/.test(action)) {
      return {
        smooch_menu_option_keyword: action,
        smooch_menu_option_value: 'custom_resource',
        smooch_menu_custom_resource_id: action,
        smooch_menu_option_label: label,
        smooch_menu_option_description: description,
        smooch_menu_option_id: id,
        smooch_menu_option_nlu_keywords: keywords,
        smooch_menu_project_media_title: '',
        smooch_menu_project_media_id: '',
      };
    }
    return {
      smooch_menu_option_keyword: action,
      smooch_menu_option_value: action,
      smooch_menu_option_label: label,
      smooch_menu_option_description: description,
      smooch_menu_option_id: id,
      smooch_menu_option_nlu_keywords: keywords,
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

  const handleSaveOption = (label, description, action, id, keywords) => {
    const newOption = buildOption(label, description, action, id, keywords);
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
    <div className={cx(styles['setting-content-container-inner'], styles['tipline-menu-options'])}>
      <div className={styles['setting-content-container-title']}>
        {/* Title */}
        { readOnly ? value.smooch_menu_title : null }
        { noTitleNoDescription ?
          <FormattedMessage
            defaultMessage="Menu options"
            description="Default label for a main menu section title field on tipline bot settings."
            id="smoochBotMainMenuSection.defaultSectionTitle"
          /> : null}
        { !readOnly && !noTitleNoDescription ?
          <TextField
            className={styles['tipline-settings-menu-title']}
            componentProps={{
              size: 24,
              minLength: 1,
              maxLength: 24,
            }}
            defaultValue={value.smooch_menu_title}
            disabled={readOnly}
            error={options.length > 0 && !value.smooch_menu_title}
            key={`title-${number}`}
            label={
              <FormattedMessage
                defaultMessage="Menu Title - 24 characters limit"
                description="Label for a main menu section title field on tipline bot settings."
                id="smoochBotMainMenuSection.sectionTitle"
              />
            }
            required
            variant="contained"
            onBlur={(e) => { onChangeTitle(e.target.value); }}
          /> : null }
      </div>

      {/* No options */}
      { options.length === 0 ?
        <FormattedMessage
          defaultMessage="There are currently no menu options in this section."
          description="Message displayed when there is no menu option on tipline bot settings."
          id="smoochBotMainMenuSection.noOptions"
          tagName="em"
        /> : null }

      {/* Each menu option */}
      { options.map((option, i) => (
        <div className={styles['tipline-menu-option']} key={formatOptionLabel(option)} my={1}>

          {/* Menu option label and reordering */}
          <div className={styles['tipline-menu-option-content']}>
            { !readOnly && options.length > 1 &&
              <Reorder
                disableDown={i === options.length - 1}
                disableUp={i === 0}
                theme="white"
                variant="horizontal"
                onMoveDown={() => { handleMoveDown(i); }}
                onMoveUp={() => { handleMoveUp(i); }}
              />
            }
            <div className="typography-body1-bold">
              {/* Menu option label */}
              {formatOptionLabel(option)}

              {/* Menu option description */}
              { !readOnly && !option.smooch_menu_option_description &&
                <div className="typography-caption">
                  <FormattedMessage
                    defaultMessage="no description"
                    description="Displayed when a tipline bot menu option doesn't have a description."
                    id="smoochBotMainMenuSection.optionNoDescription"
                    tagName="em"
                  />
                </div>
              }
              { !readOnly && option.smooch_menu_option_description &&
                <div className="typography-caption">
                  { option.smooch_menu_option_description }
                </div>
              }
            </div>
          </div>

          {/* Menu option buttons: edit and delete */}
          <div className={styles['tipline-menu-option-actions']}>
            <Tooltip
              arrow
              title={
                readOnly ?
                  <FormattedMessage
                    defaultMessage="This menu option cannot be edited"
                    description="Tooltip for the edit menu read only option"
                    id="smoochBotMainMenuSection.editMenuOptionReadOnly"
                  />
                  :
                  <FormattedMessage
                    defaultMessage="Edit Menu Option"
                    description="Tooltip for the edit menu option"
                    id="smoochBotMainMenuSection.editMenuOption"
                  />
              }
            >
              <span>
                <ButtonMain
                  disabled={readOnly}
                  iconCenter={<EditIcon />}
                  size="default"
                  theme="lightInfo"
                  variant="contained"
                  onClick={() => { handleEditOption(i); }}
                />
              </span>
            </Tooltip>
            <Tooltip
              arrow
              title={
                readOnly || (!optional && options.length === 1) ?
                  <FormattedMessage
                    defaultMessage="This menu option cannot be removed"
                    description="Tooltip for the remove menu read only option"
                    id="smoochBotMainMenuSection.removeMenuOptionReadOnly"
                  />
                  :
                  <FormattedMessage
                    defaultMessage="Remove Menu Option"
                    description="Tooltip for the remove menu option"
                    id="smoochBotMainMenuSection.removeMenuOption"
                  />
              }
            >
              <span>
                <ButtonMain
                  disabled={readOnly || (!optional && options.length === 1)}
                  iconCenter={<CancelIcon />}
                  size="default"
                  theme="lightInfo"
                  variant="contained"
                  onClick={() => { handleDeleteOption(i); }}
                />
              </span>
            </Tooltip>
          </div>
        </div>
      ))}

      {/* Add a new menu option */}
      { !readOnly &&
        <div className={styles['setting-content-container-actions']}>
          <ButtonMain
            disabled={readOnly}
            iconLeft={<AddIcon />}
            label={
              <FormattedMessage
                defaultMessage="New Menu Option"
                description="Button label to create a new main menu option on tipline bot settings."
                id="smoochBotMainMenuSection.newOption"
              />
            }
            size="default"
            theme="info"
            variant="contained"
            onClick={handleAddNewOption}
          />
        </div>
      }

      {/* Dialog: Add new option */}
      { showNewOptionDialog ?
        <SmoochBotMainMenuOption
          menu={menu}
          resources={resources}
          onCancel={handleCancel}
          onSave={handleSaveNewOption}
        /> : null }

      {/* Dialog: Edit option */}
      { editingOptionIndex > -1 ?
        <SmoochBotMainMenuOption
          currentDescription={options[editingOptionIndex].smooch_menu_option_description}
          currentKeywords={options[editingOptionIndex].smooch_menu_option_nlu_keywords}
          currentLanguage={currentLanguage}
          currentTitle={options[editingOptionIndex].smooch_menu_option_label}
          currentUser={currentUser}
          currentValue={options[editingOptionIndex].smooch_menu_option_value === 'custom_resource' ? options[editingOptionIndex].smooch_menu_custom_resource_id : options[editingOptionIndex].smooch_menu_option_value}
          hasUnsavedChanges={hasUnsavedChanges}
          id={options[editingOptionIndex].smooch_menu_option_id}
          index={editingOptionIndex}
          menu={menu}
          resources={resources}
          onCancel={handleCancel}
          onSave={handleSaveOption}
        /> : null }

      {/* Dialog: Can't add more menu options */}
      <ConfirmProceedDialog
        body={
          <FormattedMessage
            defaultMessage="The maximum number of options in the main menu is 10."
            description="Text of a dialog that is displayed when user tries to add a new option to the tipline bot menu but the maximum number of options was reached."
            id="smoochBotMainMenuSection.maxOptionsReachedDescription"
            tagName="p"
          />
        }
        open={showErrorDialog}
        proceedLabel={
          <FormattedMessage
            defaultMessage="Go back"
            description="A label on a button that the user can press to go back to the screen where they edit the tipline bot menu options."
            id="smoochBotMainMenuSection.maxOptionsReachedLabel"
          />
        }
        title={
          <FormattedMessage
            defaultMessage="Maximum menu options"
            description="Title of a dialog that is displayed when user tries to add a new option to the tipline bot menu but the maximum number of options was reached."
            id="smoochBotMainMenuSection.maxOptionsReachedTitle"
          />
        }
        onCancel={() => { setShowErrorDialog(false); }}
        onProceed={() => { setShowErrorDialog(false); }}
      />
    </div>
  );
};

SmoochBotMainMenuSection.defaultProps = {
  value: {},
  resources: [],
  readOnly: false,
  optional: false,
  hasUnsavedChanges: false,
  noTitleNoDescription: false,
  canCreate: true,
};

SmoochBotMainMenuSection.propTypes = {
  canCreate: PropTypes.bool,
  currentLanguage: PropTypes.string.isRequired,
  currentUser: PropTypes.shape({ is_admin: PropTypes.bool.isRequired }).isRequired,
  hasUnsavedChanges: PropTypes.bool,
  noTitleNoDescription: PropTypes.bool,
  number: PropTypes.number.isRequired,
  optional: PropTypes.bool,
  readOnly: PropTypes.bool,
  resources: PropTypes.arrayOf(PropTypes.object),
  value: PropTypes.object,
  onChangeMenuOptions: PropTypes.func.isRequired,
  onChangeTitle: PropTypes.func.isRequired,
};

export default SmoochBotMainMenuSection;
