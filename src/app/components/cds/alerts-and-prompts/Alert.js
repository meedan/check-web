import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import {
  Box,
  Typography,
} from '@material-ui/core';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import Button from '@material-ui/core/Button';
import CheckCircleOutlineOutlinedIcon from '@material-ui/icons/CheckCircleOutlineOutlined';
import IconButton from '@material-ui/core/IconButton';
import IconClose from '@material-ui/icons/Close';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import {
  validationLight,
  otherWhite,
  validationMain,
  validationSecondary,
  alertLight,
  alertSecondary,
  alertMain,
  errorLight,
  errorMain,
  errorSecondary,
  brandMain,
  brandSecondary,
  brandBackground,
  units,
} from '../../../styles/js/shared';

const useStyles = makeStyles(theme => ({
  box: {
    borderRadius: theme.spacing(2),
    padding: theme.spacing(2),
    position: 'relative',
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
  closeButton: {
    position: 'absolute',
    right: '0',
    top: '0',
  },
  secondaryButton: {
    color: otherWhite,
    margin: `${units(1)} auto`,
    borderRadius: theme.spacing(1),
    width: units(15),
  },
}));

const alertTypes = {
  success: {
    icon: <CheckCircleOutlineOutlinedIcon style={{ color: validationMain }} />,
    primaryColor: validationLight,
    secondaryColor: validationSecondary,
    borderInfo: `1px solid ${validationSecondary} `,
  },
  warning: {
    icon: <ErrorOutlineIcon style={{ color: alertMain }} />,
    primaryColor: alertLight,
    secondaryColor: alertSecondary,
    borderInfo: `1px solid ${alertSecondary} `,
  },
  info: {
    icon: <InfoOutlinedIcon style={{ color: brandMain }} />,
    primaryColor: brandBackground,
    secondaryColor: brandSecondary,
    borderInfo: `1px solid ${brandSecondary} `,
  },
  error: {
    icon: <ErrorOutlineIcon style={{ color: errorMain }} />,
    primaryColor: errorLight,
    secondaryColor: errorSecondary,
    borderInfo: `1px solid ${errorSecondary} `,
  },
};

function Alert({
  title,
  content,
  type,
  dismiss,
  button,
  dropShadow,
  handleClick,
  onClose,
}) {
  const classes = useStyles();
  return (
    <Box className={[classes.box, 'alert'].join(' ')} style={{ background: alertTypes[type].primaryColor, border: dropShadow ? alertTypes[type].borderInfo : null }} display="flex" alignItems="flex-start">
      {alertTypes[type]?.icon ? <Box mr={1}>{alertTypes[type].icon}</Box> : null}
      {dismiss ?
        <IconButton
          className={classes.closeButton}
          onClick={onClose}
        >
          <IconClose />
        </IconButton>
        : null}
      <Box>
        <Typography variant="subtitle2" className={[classes.title, 'alert-title'].join(' ')} style={{ color: alertTypes[type].secondaryColor }}>
          {title}
        </Typography>
        {content ?
          <Typography variant="body2" className={[classes.content, 'alert-content'].join(' ')} style={{ color: alertTypes[type].secondaryColor }}>
            {content}
          </Typography> : null}
        {button ?
          <Button
            className={classes.secondaryButton}
            style={{ background: alertTypes[type].secondaryColor }}
            variant="contained"
            onClick={handleClick}
          >
            {button}
          </Button>
          : null}
      </Box>
    </Box>
  );
}

Alert.defaultProps = {
  content: '',
  title: '',
  dismiss: false,
  button: null,
  handleClick: null,
  onClose: null,
  dropShadow: false,
};

Alert.propTypes = {
  title: PropTypes.object,
  content: PropTypes.object,
  dismiss: PropTypes.bool,
  dropShadow: PropTypes.bool,
  button: PropTypes.string,
  handleClick: PropTypes.func,
  onClose: PropTypes.func,
};

export default Alert;
