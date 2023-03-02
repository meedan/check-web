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
  validationSecondary,
  alertLight,
  alertSecondary,
  alertMain,
  errorLight,
  errorMain,
  errorSecondary,
} from '../../../styles/js/shared';

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
  buttonContent: {

  },
}));

const alertTypes = {
  success: {
    icon: <CheckCircleOutlineOutlinedIcon style={{ color: validationSecondary }} />,
    primaryColor: validationLight,
    secondaryColor: validationSecondary,
    buttonColor: validationSecondary,
  },
  warning: {
    icon: <ErrorOutlineIcon style={{ color: alertMain }} />,
    primaryColor: alertLight,
    secondaryColor: alertSecondary,
    buttonColor: alertSecondary,
  },
  info: {
    icon: <InfoOutlinedIcon style={{ color: alertSecondary }} />,
    primaryColor: alertLight,
    secondaryColor: alertSecondary,
    buttonColor: alertSecondary,
  },
  error: {
    icon: <ErrorOutlineIcon style={{ color: errorMain }} />,
    primaryColor: errorLight,
    secondaryColor: errorSecondary,
    buttonColor: errorSecondary,
  },
};

const Alert = ({
  title,
  content,
  type,
  button,
  dismiss,
  buttonContent,
}) => {
  // eslint-disable-next-line
  // console.log("alertType", alertType)

  const [showAlert, setShowAlert] = React.useState(true);

  const handleClose = () => {
    setShowAlert(false);
  };

  const classes = useStyles();
  return showAlert ? (
    <Box className={[classes.box, 'alert'].join(' ')} style={{ background: alertTypes[type].primaryColor }} display="flex" alignItems="flex-start">
      { alertTypes[type]?.icon ? <Box mr={1}>{alertTypes[type].icon}</Box> : null }
      <Box>
        <Typography variant="body1" className={[classes.title, 'alert-title'].join(' ')} style={{ color: alertTypes[type].secondaryColor }}>
          {title}
        </Typography>
        { content ?
          <Typography variant="body2" className={[classes.content, 'alert-content'].join(' ')} style={{ color: alertTypes[type].secondaryColor }}>
            {content}
          </Typography> : null }
        { button ?
          <Button
            variant="contained"
            color="primary"
            // color={alertTypes[type].buttonColor}
            style={{ width: '10%' }}
          >
            { buttonContent }
          </Button>
          : null
        }
        { dismiss ?
          <IconButton
            onClick={handleClose}
          >
            <IconClose />
          </IconButton>
          : null
        }
      </Box>
    </Box>
  ) : null;
};

Alert.defaultProps = {
  content: 'alert-content',
  button: null,
  dismiss: true,
  buttonContent: 'content',
};

Alert.propTypes = {
  title: PropTypes.object.isRequired,
  content: PropTypes.object,
  button: PropTypes.object,
  dismiss: PropTypes.string,
  buttonContent: PropTypes.string,
};

export default Alert;
