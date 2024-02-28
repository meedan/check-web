import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import TextField from '../../cds/inputs/TextField';
import CancelIcon from '../../../icons/cancel.svg';
import EditIcon from '../../../icons/edit.svg';
import LockIcon from '../../../icons/lock.svg';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import SmoochBotMainMenuOption from './SmoochBotMainMenuOption';
import ConfirmProceedDialog from '../../layout/ConfirmProceedDialog';
import Reorder from '../../layout/Reorder';
import AddIcon from '../../../icons/add.svg';
import styles from '../Settings.module.css';

const SmoochBotMainMenuSection = ({
  number,
  value,
  resources,
  readOnly,
  optional,
  noTitleNoDescription,
  currentUser,
  currentLanguage,
  canCreate,
  hasUnsavedChanges,
  onChangeTitle,
  onChangeMenuOptions,
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

  const buildOption = (label, description, action, keywords) => {
    // If it's a sequence of digits, then it represents a resource
    if (/^[0-9]+$/.test(action)) {
      return {
        smooch_menu_option_keyword: action,
        smooch_menu_option_value: 'custom_resource',
        smooch_menu_custom_resource_id: action,
        smooch_menu_option_label: label,
        smooch_menu_option_description: description,
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

  const handleSaveOption = (label, description, action, keywords) => {
    const newOption = buildOption(label, description, action, keywords);
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
    <div className={styles['setting-content-container-inner']}>
      <div className={styles['setting-content-container-title']}>
        {/* Title */}
        { readOnly ? value.smooch_menu_title : null }
        { noTitleNoDescription ?
          <FormattedMessage
            id="smoochBotMainMenuSection.defaultSectionTitle"
            defaultMessage="Menu options"
            description="Default label for a main menu section title field on tipline bot settings."
          /> : null}
        { !readOnly && !noTitleNoDescription ?
          <TextField
            key={`title-${number}`}
            label={
              <FormattedMessage
                id="smoochBotMainMenuSection.sectionTitle"
                defaultMessage="Title - 24 characters limit"
                description="Label for a main menu section title field on tipline bot settings."
              />
            }
            variant="contained"
            componentProps={{
              size: 24,
              minLength: 1,
              maxLength: 24,
            }}
            required
            disabled={readOnly}
            onBlur={(e) => { onChangeTitle(e.target.value); }}
            defaultValue={value.smooch_menu_title}
            error={options.length > 0 && !value.smooch_menu_title}
          /> : null }
        {/* Add a new menu option */}
        <div className={styles['setting-content-container-actions']}>
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
        </div>
      </div>

      <hr />

      {/* No options */}
      { options.length === 0 ?
        <FormattedMessage
          tagName="p"
          id="smoochBotMainMenuSection.noOptions"
          defaultMessage="There is currently no option in this section."
          description="Message displayed when there is no menu option on tipline bot settings."
        /> : null }

      {/* Each menu option */}
      { options.map((option, i) => (
        <div my={1} key={formatOptionLabel(option)} className={styles['tipline-menu-option']}>

          {/* Menu option label and reordering */}
          <div className={styles['tipline-menu-option-content']}>
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
            <div className="typography-body1-bold">
              {/* Menu option label */}
              {formatOptionLabel(option)}

              {/* Menu option description */}
              { !readOnly && !option.smooch_menu_option_description &&
                <div className="typography-caption">
                  <em>
                    <FormattedMessage
                      id="smoochBotMainMenuSection.optionNoDescription"
                      defaultMessage="no description"
                      description="Displayed when a tipline bot menu option doesn't have a description."
                    />
                  </em>
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
            { readOnly ?
              null :
              <ButtonMain
                iconCenter={<EditIcon />}
                variant="contained"
                theme="lightBrand"
                size="default"
                disabled={readOnly}
                onClick={() => { handleEditOption(i); }}
              />
            }
            { readOnly || (!optional && options.length === 1) ?
              null :
              <ButtonMain
                iconCenter={<CancelIcon />}
                variant="contained"
                theme="lightBrand"
                size="default"
                onClick={() => { handleDeleteOption(i); }}
              />
            }
            { readOnly || (!optional && options.length === 1) ?
              <ButtonMain
                iconCenter={<LockIcon />}
                variant="text"
                theme="lightText"
                size="default"
                disabled
              />
              : null }
          </div>
        </div>
      ))}

      {/* Dialog: Add new option */}
      { showNewOptionDialog ?
        <SmoochBotMainMenuOption
          menu={menu}
          resources={resources}
          onSave={handleSaveNewOption}
          onCancel={handleCancel}
        /> : null }

      {/* Dialog: Edit option */}
      { editingOptionIndex > -1 ?
        <SmoochBotMainMenuOption
          menu={menu}
          resources={resources}
          onSave={handleSaveOption}
          onCancel={handleCancel}
          currentTitle={options[editingOptionIndex].smooch_menu_option_label}
          currentDescription={options[editingOptionIndex].smooch_menu_option_description}
          currentValue={options[editingOptionIndex].smooch_menu_option_value === 'custom_resource' ? options[editingOptionIndex].smooch_menu_custom_resource_id : options[editingOptionIndex].smooch_menu_option_value}
          currentUser={currentUser}
          currentKeywords={options[editingOptionIndex].smooch_menu_option_nlu_keywords}
          hasUnsavedChanges={hasUnsavedChanges}
          index={editingOptionIndex}
          currentLanguage={currentLanguage}
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
  number: PropTypes.number.isRequired,
  value: PropTypes.object,
  resources: PropTypes.arrayOf(PropTypes.object),
  readOnly: PropTypes.bool,
  optional: PropTypes.bool,
  noTitleNoDescription: PropTypes.bool,
  canCreate: PropTypes.bool,
  currentUser: PropTypes.shape({ is_admin: PropTypes.bool.isRequired }).isRequired,
  currentLanguage: PropTypes.string.isRequired,
  hasUnsavedChanges: PropTypes.bool,
  onChangeTitle: PropTypes.func.isRequired,
  onChangeMenuOptions: PropTypes.func.isRequired,
};

export default SmoochBotMainMenuSection;
