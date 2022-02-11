/* eslint-disable @calm/react-intl/missing-attribute */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import ClearIcon from '@material-ui/icons/Clear';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import SmoochBotTextEditor from './SmoochBotTextEditor';
import SmoochBotMenuOption from './SmoochBotMenuOption';
import { brandHighlight } from '../../../styles/js/shared';

const useStyles = makeStyles(theme => ({
  button: {
    color: brandHighlight,
  },
  iconButton: {
    color: brandHighlight,
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
        value={props.value.smooch_menu_message}
        onChange={handleChangeText}
        field={props.field}
        extraTextFieldProps={
          props.textHeader ?
            {
              InputProps: {
                className: classes.content,
                startAdornment: (
                  <InputAdornment position="start" className={classes.header}>
                    {props.textHeader}
                    <Divider className={classes.divider} />
                  </InputAdornment>
                ),
              },
            } :
            {}
        }
      />
      {menuOptions.map((option, index) => (
        <Box display="flex" key={Math.random().toString().substring(2, 10)}>
          <SmoochBotMenuOption
            field={props.field}
            languages={props.languages}
            option={option}
            menuActions={props.menuActions}
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
          field={props.field}
          currentLanguage={props.currentLanguage}
          languages={[]}
          option={{
            smooch_menu_option_keyword: '9',
            smooch_menu_option_value: 'tos',
          }}
          menuActions={[]}
          resources={[]}
          onChange={() => {}}
          readOnly
        /> : null }
      <Button onClick={handleAddOption} startIcon={<AddIcon />} className={classes.button}>
        <FormattedMessage
          id="smoochBotMenuEditor.scenario"
          defaultMessage="Scenario"
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
