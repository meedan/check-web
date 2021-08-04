import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import HelpIcon from '@material-ui/icons/HelpOutline';
import { checkBlue } from '../../styles/js/shared';

const useStyles = makeStyles(theme => ({
  settingsHeaderRoot: {
    marginBottom: theme.spacing(2),
  },
  settingsHeaderToolbar: {
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingsHeaderTitle: {
    justifyContent: 'left',
    alignItems: 'center',
  },
  settingsHeaderHelpIcon: {
    color: checkBlue,
  },
}));

const SettingsHeader = ({
  title,
  subtitle,
  helpUrl,
  actionButton,
  extra,
  className,
  style,
}) => {
  const classes = useStyles();

  const handleHelp = () => {
    window.open(helpUrl);
  };

  return (
    <Box className={['component__settings-header', classes.settingsHeaderRoot, className].join(' ')} style={style}>
      <Toolbar className={classes.settingsHeaderToolbar}>
        <Box display="flex" justifyContent="center" className={classes.settingsHeaderTitle}>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
          { helpUrl ?
            <IconButton onClick={handleHelp}>
              <HelpIcon className={classes.settingsHeaderHelpIcon} />
            </IconButton>
            : null
          }
        </Box>
        <Box display="flex" alignItems="center">
          {extra}
          {actionButton}
        </Box>
      </Toolbar>
      { subtitle ?
        <Typography>
          {subtitle}
        </Typography> : null }
    </Box>
  );
};

SettingsHeader.defaultProps = {
  actionButton: null,
  subtitle: null,
  extra: null,
  helpUrl: null,
  className: '',
  style: {},
};

SettingsHeader.propTypes = {
  title: PropTypes.node.isRequired,
  helpUrl: PropTypes.string,
  actionButton: PropTypes.node,
  subtitle: PropTypes.node,
  extra: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object,
};

export default SettingsHeader;
