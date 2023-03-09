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
import ReportProblemOutlinedIcon from '@material-ui/icons/ReportProblemOutlined';

import {
  validationLight,
  otherWhite,
  validationSecondary,
  alertLight,
  alertSecondary,
  errorLight,
  errorSecondary,
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
    padding: 0,
  },
  smallButton: {
    color: otherWhite,
    marginTop: theme.spacing(1.5),
    marginBottom: 0,
    borderRadius: theme.spacing(1),
    width: units(15),
    padding: 0,
  },
}));

const alertTypes = {
  success: {
    icon: <CheckCircleOutlineOutlinedIcon style={{ color: validationSecondary }} />,
    primaryColor: validationLight,
    secondaryColor: validationSecondary,
    borderInfo: `1px solid ${validationSecondary} `,
  },
  warning: {
    icon: <ReportProblemOutlinedIcon style={{ color: alertSecondary }} />,
    primaryColor: alertLight,
    secondaryColor: alertSecondary,
    borderInfo: `1px solid ${alertSecondary} `,
  },
  info: {
    icon: <InfoOutlinedIcon style={{ color: brandSecondary }} />,
    primaryColor: brandBackground,
    secondaryColor: brandSecondary,
    borderInfo: `1px solid ${brandSecondary} `,
  },
  error: {
    icon: <ErrorOutlineIcon style={{ color: errorSecondary }} />,
    primaryColor: errorLight,
    secondaryColor: errorSecondary,
    borderInfo: `1px solid ${errorSecondary} `,
  },
};

function Alert({
  title,
  content,
  type,
  buttonLabel,
  hasBorder,
  onButtonClick,
  onClose,
}) {
  const classes = useStyles();
  return (
    <Box className={[classes.box, 'alert'].join(' ')} style={{ background: alertTypes[type].primaryColor, border: hasBorder ? alertTypes[type].borderInfo : null, boxShadow: hasBorder ? '0 4px 16px rgba(0, 0, 0, 0.1)' : null }} display="flex" alignItems="flex-start">
      {alertTypes[type]?.icon ? <Box mr={1}>{alertTypes[type].icon}</Box> : null}
      <Box>
        <Typography variant="subtitle2" style={{ color: alertTypes[type].secondaryColor }}>
          {title}
        </Typography>
        {content ?
          <Typography variant="body2" className={[classes.content, 'alert-content'].join(' ')} style={{ color: alertTypes[type].secondaryColor }}>
            {content}
          </Typography> : null}
        {buttonLabel ?
          <Button
            className={classes.smallButton}
            style={{ background: alertTypes[type].secondaryColor }}
            variant="contained"
            onClick={onButtonClick}
          >
            {buttonLabel}
          </Button>
          : null}
      </Box>
      {onClose ?
        <Box>
          <IconButton
            className={classes.closeButton}
            style={{ color: alertTypes[type].secondaryColor }}
            onClick={onClose}
          >
            <IconClose />
          </IconButton>
        </Box>
        : null}
    </Box>
  );
}

Alert.defaultProps = {
  content: '',
  title: '',
  buttonLabel: null,
  onButtonClick: null,
  onClose: null,
  hasBorder: false,
};

Alert.propTypes = {
  title: PropTypes.object,
  content: PropTypes.object,
  hasBorder: PropTypes.bool,
  buttonLabel: PropTypes.string,
  onButtonClick: PropTypes.func,
  onClose: PropTypes.func,
};

export default Alert;
