import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import ClearIcon from '@material-ui/icons/Clear';
import InputAdornment from '@material-ui/core/InputAdornment';
import SmoochBotSelectReport from './SmoochBotSelectReport';
import languagesList from '../../../languagesList';
import { checkBlue, inProgressYellow } from '../../../styles/js/shared';

const useStyles = makeStyles(theme => ({
  paper: {
    width: '100%',
    boxShadow: 'none',
    border: `2px solid ${inProgressYellow}`,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  box: {
    padding: theme.spacing(2),
  },
  ifTitle: {
    color: inProgressYellow,
  },
  thenTitle: {
    color: checkBlue,
  },
  title: {
    textTransform: 'uppercase',
  },
  caption: {
    margin: `0 ${theme.spacing(1)}px`,
  },
  button: {
    cursor: 'pointer',
  },
}));

const actionLabels = {
  main_state: <FormattedMessage id="smoochBotMenuOption.mainState" defaultMessage="Main menu" />,
  secondary_state: <FormattedMessage id="smoochBotMenuOption.secondaryState" defaultMessage="Secondary menu" />,
  query_state: <FormattedMessage id="smoochBotMenuOption.queryState" defaultMessage="Query prompt" />,
  resource: <FormattedMessage id="smoochBotMenuOption.resource" defaultMessage="Report" />,
};

const SmoochBotMenuOption = (props) => {
  const classes = useStyles();
  const { option } = props;
  const [showReportDialog, setShowReportDialog] = React.useState(null);

  const handleChangeKeywords = (event) => {
    props.onChange({ smooch_menu_option_keyword: event.target.value });
  };

  const handleSelectAction = (event) => {
    const action = event.target.value;
    if (action === 'resource') {
      setShowReportDialog(true);
    } else {
      props.onChange({ smooch_menu_option_value: event.target.value });
    }
  };

  const handleSelectReport = (report) => {
    props.onChange({
      smooch_menu_option_value: 'resource',
      smooch_menu_project_media_title: report.text,
      smooch_menu_project_media_id: report.value,
    });
  };

  const handleClearReport = () => {
    props.onChange({ smooch_menu_project_media_title: '', smooch_menu_project_media_id: '' });
  };

  return (
    <Paper className={classes.paper}>
      <Box display="flex">
        <Box flex="1" className={classes.box}>
          <Box display="flex" alignItems="center">
            <Typography className={[classes.title, classes.ifTitle].join(' ')} component="div" variant="subtitle1">
              <FormattedMessage
                id="smoochBotMenuOption.if"
                defaultMessage="If"
              />
            </Typography>
            <Typography component="div" variant="caption" className={classes.caption}>
              <FormattedMessage
                id="smoochBotMenuOption.condition"
                defaultMessage="The following keyword is matched"
              />
            </Typography>
          </Box>
          <TextField
            key={Math.random().toString().substring(2, 10)}
            defaultValue={option.smooch_menu_option_keyword}
            onBlur={handleChangeKeywords}
            variant="outlined"
            fullWidth
          />
        </Box>
        <Box flex="1" className={classes.box}>
          <Box display="flex" alignItems="center">
            <Typography className={[classes.title, classes.thenTitle].join(' ')} component="div" variant="subtitle1">
              <FormattedMessage
                id="smoochBotMenuOption.then"
                defaultMessage="Then"
              />
            </Typography>
            <Typography component="div" variant="caption" className={classes.caption}>
              <FormattedMessage
                id="smoochBotMenuOption.action"
                defaultMessage="Respond with"
              />
            </Typography>
          </Box>
          { option.smooch_menu_project_media_id && option.smooch_menu_project_media_title ?
            <TextField
              key={option.smooch_menu_project_media_id}
              defaultValue={option.smooch_menu_project_media_title}
              InputProps={{
                endAdornment: (
                  <InputAdornment onClick={handleClearReport} className={classes.button}>
                    <ClearIcon />
                  </InputAdornment>
                ),
              }}
              variant="outlined"
              fullWidth
              disabled
            /> :
            <Select
              value={option.smooch_menu_option_value}
              onChange={handleSelectAction}
              variant="outlined"
              fullWidth
            >
              {props.menuActions.map(action => (
                <MenuItem value={action.key} key={action.key}>
                  {actionLabels[action.key]}
                </MenuItem>
              ))}
              {props.languages.map(language => (
                <MenuItem value={language} key={language}>
                  <FormattedMessage
                    id="smoochBotMenuOption.languageAction"
                    defaultMessage="{languageName} (main menu)"
                    values={{
                      languageName: languagesList[language].nativeName,
                    }}
                  />
                </MenuItem>
              ))}
            </Select> }
        </Box>
      </Box>
      { showReportDialog ?
        <SmoochBotSelectReport
          onSelect={(resource) => {
            handleSelectReport(resource);
            setShowReportDialog(false);
          }}
          onDismiss={() => {
            setShowReportDialog(false);
          }}
        /> : null }
    </Paper>
  );
};

SmoochBotMenuOption.propTypes = {
  languages: PropTypes.arrayOf(PropTypes.string).isRequired,
  menuActions: PropTypes.arrayOf(PropTypes.object).isRequired,
  option: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default SmoochBotMenuOption;
