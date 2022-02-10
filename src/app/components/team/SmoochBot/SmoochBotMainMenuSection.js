import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import SmoochBotMainMenuOption from './SmoochBotMainMenuOption';
import { opaqueBlack23 } from '../../../styles/js/shared';

const useStyles = makeStyles(theme => ({
  box: {
    background: '#F6F6F6',
    border: `1px solid ${opaqueBlack23}`,
    borderRadius: theme.spacing(0.5),
  },
  textField: {
    background: 'white',
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  title: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  arrows: {
    flexDirection: 'column',
  },
  arrow: {
    margin: 0,
    padding: theme.spacing(0.25),
  },
}));

const SmoochBotMainMenuSection = ({
  number,
  value,
  resources,
  readOnly,
  optional,
  onChangeTitle,
  onChangeMenuOptions,
}) => {
  const classes = useStyles();
  const [showNewOptionDialog, setShowNewOptionDialog] = React.useState(false);
  const [editingOptionIndex, setEditingOptionIndex] = React.useState(-1);

  const options = value.smooch_menu_options || [];

  const handleAddNewOption = () => {
    setShowNewOptionDialog(true);
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

  const buildOption = (label, action) => {
    // If it's a sequence of digits, then it represents a resource
    if (/^[0-9]+$/.test(action)) {
      return {
        smooch_menu_option_keyword: action,
        smooch_menu_option_value: 'custom_resource',
        smooch_menu_custom_resource_id: action,
        smooch_menu_option_label: label,
        smooch_menu_project_media_title: '',
        smooch_menu_project_media_id: '',
      };
    }
    return {
      smooch_menu_option_keyword: action,
      smooch_menu_option_value: action,
      smooch_menu_option_label: label,
      smooch_menu_project_media_title: '',
      smooch_menu_project_media_id: '',
    };
  };

  const handleSaveNewOption = (label, action) => {
    const newOption = buildOption(label, action);
    const newOptions = options.slice();
    newOptions.push(newOption);
    onChangeMenuOptions(newOptions);
    setShowNewOptionDialog(false);
  };

  const handleSaveOption = (label, action) => {
    const newOption = buildOption(label, action);
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
      const resource = resources.find(r => r.smooch_custom_resource_id === option.smooch_menu_custom_resource_id);
      if (resource) {
        return resource.smooch_custom_resource_title;
      }
    }
    return option.smooch_menu_option_value;
  };

  return (
    <Box className={classes.box} my={1}>
      <Box display="flex" alignItems="center" justifyContent="space-between" p={1}>
        <Box display="flex" alignItems="center">

          {/* Section header */}
          <Typography variant="body2" component="div" align="center">
            <strong>
              <FormattedMessage id="smoochBotMainMenuSection.section" defaultMessage="Section {number}" description="Label for each menu section on tipline bot settings." values={{ number }} />
            </strong>
            { optional ?
              <small>
                <br />
                <FormattedMessage id="smoochBotMainMenuSection.optional" defaultMessage="(optional)" description="Flags an optional menu section on tipline bot settings." />
              </small> : null }
          </Typography>
          {' '}

          {/* Title */}
          { readOnly ?
            <Typography variant="body2" component="div" className={classes.title}>
              <strong>
                {value.smooch_menu_title}
              </strong>
            </Typography> :
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
              inputProps={{ maxLength: 24 }}
              size="small"
              disabled={readOnly}
              onBlur={(e) => { onChangeTitle(e.target.value); }}
              defaultValue={value.smooch_menu_title}
            />
          }
        </Box>

        {/* Add a new menu option */}
        <Button color="primary" variant="contained" disabled={readOnly} onClick={handleAddNewOption}>
          <FormattedMessage
            id="smoochBotMainMenuSection.newOption"
            defaultMessage="New option"
            description="Button label to create a new main menu option on tipline bot settings."
          />
        </Button>
      </Box>

      <Divider />

      {/* Each menu option */}
      <Box p={1}>
        { options.map((option, i) => (
          <Box display="flex" alignItems="center" justifyContent="space-between" my={1} key={option}>

            {/* Menu option label and arrows */}
            <Box display="flex" alignItems="center">

              {/* Arrows */}
              { readOnly ?
                null :
                <Box display="flex" className={classes.arrows}>
                  <IconButton onClick={() => { handleMoveUp(i); }} disabled={i === 0} className={classes.arrow}>
                    <ArrowUpwardIcon fontSize="small" />
                  </IconButton>
                  <IconButton onClick={() => { handleMoveDown(i); }} disabled={i === options.length - 1} className={classes.arrow}>
                    <ArrowDownwardIcon fontSize="small" />
                  </IconButton>
                </Box> }
              {' '}

              {/* Menu option label */}
              <Typography variant="body2" component="div">
                {formatOptionLabel(option)}
              </Typography>
            </Box>

            {/* Menu option buttons: edit and delete */}
            <Box display="flex" alignItems="center">

              {/* Edit */}
              { readOnly ?
                null :
                <Button disabled={readOnly} onClick={() => { handleEditOption(i); }} variant="outlined" size="small">
                  <FormattedMessage
                    id="smoochBotMainMenuSection.editOption"
                    defaultMessage="Edit"
                    description="Button label to edit a main menu option on tipline bot settings."
                  />
                </Button> }
              {' '}

              {/* Delete */}
              { readOnly ?
                null :
                <IconButton onClick={() => { handleDeleteOption(i); }}>
                  <DeleteIcon />
                </IconButton> }

              {/* Locked */}
              { readOnly ? <LockOutlinedIcon /> : null }
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
          currentValue={options[editingOptionIndex].smooch_menu_option_value === 'custom_resource' ? options[editingOptionIndex].smooch_menu_custom_resource_id : options[editingOptionIndex].smooch_menu_option_value}
          onSave={handleSaveOption}
          onCancel={handleCancel}
        /> : null }
    </Box>
  );
};

SmoochBotMainMenuSection.defaultProps = {
  value: {},
  resources: [],
  readOnly: false,
  optional: false,
};

SmoochBotMainMenuSection.propTypes = {
  number: PropTypes.number.isRequired,
  value: PropTypes.object,
  resources: PropTypes.arrayOf(PropTypes.object),
  readOnly: PropTypes.bool,
  optional: PropTypes.bool,
  onChangeTitle: PropTypes.func.isRequired,
  onChangeMenuOptions: PropTypes.func.isRequired,
};

export default SmoochBotMainMenuSection;
