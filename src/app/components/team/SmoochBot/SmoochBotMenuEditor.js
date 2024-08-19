/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import SmoochBotTextEditor from './SmoochBotTextEditor';
import SmoochBotMenuOption from './SmoochBotMenuOption';
import AddIcon from '../../../icons/add_circle.svg';
import ClearIcon from '../../../icons/clear.svg';
import ArrowUpwardIcon from '../../../icons/arrow_upward.svg';
import ArrowDownwardIcon from '../../../icons/arrow_downward.svg';

const useStyles = makeStyles(theme => ({
  button: {
    color: 'var(--color-blue-54)',
  },
  iconButton: {
    color: 'var(--color-blue-54)',
    display: 'block',
  },
  content: {
    flexWrap: 'wrap',
  },
  header: {
    height: 'initial',
    display: 'initial',
    maxHeight: 'initial',
    alignItems: 'initial',
    whiteSpace: 'initial',
    margin: 0,
    width: '100%',
  },
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));

const SmoochBotMenuEditor = (props) => {
  const classes = useStyles();
  const menuOptions = props.value.smooch_menu_options || [];

  const handleChangeText = (newValue) => {
    props.onChange({ smooch_menu_message: newValue });
  };

  const handleChangeMenu = (index, newValue) => {
    const options = menuOptions.slice(0);
    if (!options[index]) {
      options[index] = {};
    }
    Object.assign(options[index], newValue);
    props.onChange({ smooch_menu_options: options });
  };

  const handleAddOption = () => {
    const options = menuOptions.slice(0);
    options.push({
      smooch_menu_option_keyword: '',
      smooch_menu_option_value: '',
      smooch_menu_project_media_title: '',
      smooch_menu_project_media_id: '',
    });
    props.onChange({ smooch_menu_options: options });
  };

  const handleDeleteOption = (index) => {
    const options = menuOptions.slice(0);
    options.splice(index, 1);
    props.onChange({ smooch_menu_options: options });
  };

  const handleMoveOptionUp = (index) => {
    if (index > 0) {
      const options = menuOptions.slice(0);
      [options[index - 1], options[index]] = [options[index], options[index - 1]];
      props.onChange({ smooch_menu_options: options });
    }
  };

  const handleMoveOptionDown = (index) => {
    const options = menuOptions.slice(0);
    if (index < options.length - 1) {
      [options[index], options[index + 1]] = [options[index + 1], options[index]];
      props.onChange({ smooch_menu_options: options });
    }
  };

  return (
    <React.Fragment>
      <SmoochBotTextEditor
        extraTextFieldProps={
          props.textHeader ?
            {
              InputProps: {
                className: classes.content,
                startAdornment: (
                  <InputAdornment className={classes.header} position="start">
                    {props.textHeader}
                    <Divider className={classes.divider} />
                  </InputAdornment>
                ),
              },
            } :
            {}
        }
        field={props.field}
        value={props.value.smooch_menu_message}
        onChange={handleChangeText}
      />
      {menuOptions.map((option, index) => (
        <Box display="flex" key={Math.random().toString().substring(2, 10)}>
          <SmoochBotMenuOption
            field={props.field}
            languages={props.languages}
            menuActions={props.menuActions}
            option={option}
            resources={props.resources}
            onChange={(newValue) => { handleChangeMenu(index, newValue); }}
          />
          <Box>
            <IconButton
              className={classes.iconButton}
              onClick={() => { handleDeleteOption(index); }}
            >
              <ClearIcon />
            </IconButton>
            <IconButton
              className={classes.iconButton}
              onClick={() => { handleMoveOptionUp(index); }}
            >
              <ArrowUpwardIcon />
            </IconButton>
            <IconButton
              className={classes.iconButton}
              onClick={() => { handleMoveOptionDown(index); }}
            >
              <ArrowDownwardIcon />
            </IconButton>
          </Box>
        </Box>
      ))}
      { props.field === 'smooch_state_main' ?
        <SmoochBotMenuOption
          currentLanguage={props.currentLanguage}
          field={props.field}
          languages={[]}
          menuActions={[]}
          option={{
            smooch_menu_option_keyword: '9',
            smooch_menu_option_value: 'tos',
          }}
          readOnly
          resources={[]}
          onChange={() => {}}
        /> : null }
      <Button className={classes.button} startIcon={<AddIcon />} onClick={handleAddOption}>
        <FormattedMessage
          defaultMessage="Scenario"
          description="Button label for the menu editor scenario"
          id="smoochBotMenuEditor.scenario"
        />
      </Button>
    </React.Fragment>
  );
};

SmoochBotMenuEditor.defaultProps = {
  value: { smooch_menu_message: null, smooch_menu_options: [] },
  resources: [],
  textHeader: null,
};

SmoochBotMenuEditor.propTypes = {
  value: PropTypes.object,
  languages: PropTypes.arrayOf(PropTypes.string).isRequired,
  menuActions: PropTypes.arrayOf(PropTypes.object).isRequired,
  field: PropTypes.string.isRequired,
  resources: PropTypes.arrayOf(PropTypes.object),
  currentLanguage: PropTypes.string.isRequired,
  textHeader: PropTypes.object,
  onChange: PropTypes.func.isRequired,
};

export default SmoochBotMenuEditor;
