import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import {
  Box,
  Typography,
} from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  box: {
    borderRadius: theme.spacing(2),
    padding: theme.spacing(2),
  },
  title: {
    fontWeight: 600,
    fontSize: 14,
    lineHeight: `${theme.spacing(3)}px`,
  },
  content: {
    fontWeight: 400,
    fontSize: 14,
  },
}));

const Alert = ({
  icon,
  title,
  content,
  primaryColor,
  secondaryColor,
}) => {
  const classes = useStyles();
  return (
    <Box className={[classes.box, 'alert'].join(' ')} style={{ background: primaryColor }} display="flex" alignItems="flex-start">
      { icon ? <Box mr={1}>{icon}</Box> : null }
      <Box>
        <Typography variant="body1" className={[classes.title, 'alert-title'].join(' ')} style={{ color: secondaryColor }}>
          {title}
        </Typography>
        { content ?
          <Typography variant="body2" className={[classes.content, 'alert-content'].join(' ')} style={{ color: secondaryColor }}>
            {content}
          </Typography> : null }
      </Box>
    </Box>
  );
};

Alert.defaultProps = {
  icon: null,
  content: null,
  primaryColor: 'white',
  secondaryColor: 'black',
};

Alert.propTypes = {
  icon: PropTypes.node,
  title: PropTypes.object.isRequired,
  content: PropTypes.object,
  primaryColor: PropTypes.string,
  secondaryColor: PropTypes.string,
};

export default Alert;
