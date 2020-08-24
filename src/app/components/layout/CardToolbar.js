import React from 'react';
import { PropTypes } from 'prop-types';

import Box from '@material-ui/core/Box';
import HelpIcon from '@material-ui/icons/HelpOutline';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import { black87 } from '../../styles/js/shared';

const useToolbarStyles = makeStyles(theme => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
    display: 'flex',
    justifyContent: 'space-between',
  },
  title: {
    flex: '1 1 100%',
    alignSelf: 'center',
    color: black87,
  },
  button: {
    whiteSpace: 'nowrap',
  },
}));

const CardToolbar = ({
  action,
  helpUrl,
  title,
}) => {
  const classes = useToolbarStyles();

  const handleHelp = () => {
    window.open(helpUrl);
  };

  return (
    <Toolbar className={classes.root}>
      <Box display="flex" justifyContent="center">
        <Typography className={classes.title} variant="h6" component="div">
          {title}
        </Typography>
        <IconButton color="primary" onClick={handleHelp}>
          <HelpIcon />
        </IconButton>
      </Box>
      {action}
    </Toolbar>
  );
};

CardToolbar.propTypes = {
  action: PropTypes.node.isRequired,
  helpUrl: PropTypes.string.isRequired,
  title: PropTypes.node.isRequired,
};

export default CardToolbar;
