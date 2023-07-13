// DESIGNS: https://www.figma.com/file/7ZlvdotCAzeIQcbIKxOB65/Components?type=design&node-id=4-45716&mode=design&t=G3fBIdgR6AWtOlNu-4
import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import {
  Box,
  Typography,
} from '@material-ui/core';
import Tooltip from '@material-ui/core/Tooltip';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import ErrorOutlineIcon from '../../../icons/error_outline.svg';
import CheckCircleOutlineOutlinedIcon from '../../../icons/check_circle.svg';
import IconClose from '../../../icons/clear.svg';
import InfoOutlinedIcon from '../../../icons/info.svg';
import ReportProblemOutlinedIcon from '../../../icons/report_problem.svg';

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
    color: 'var(--otherWhite)',
    marginTop: theme.spacing(1.5),
    marginBottom: 0,
    borderRadius: theme.spacing(1),
    padding: '4px 6px',
  },
}));

const alertTypes = {
  success: {
    icon: <CheckCircleOutlineOutlinedIcon style={{ fontSize: '24px', color: 'var(--validationSecondary)' }} />,
    primaryColor: 'var(--validationLight)',
    secondaryColor: 'var(--validationSecondary)',
    borderBox: '1px solid var(--validationSecondary)',
  },
  warning: {
    icon: <ReportProblemOutlinedIcon style={{ fontSize: '24px', color: 'var(--alertSecondary)' }} />,
    primaryColor: 'var(--alertLight)',
    secondaryColor: 'var(--alertSecondary)',
    borderBox: '1px solid var(--alertSecondary)',
  },
  info: {
    icon: <InfoOutlinedIcon style={{ fontSize: '24px', color: 'var(--brandSecondary)' }} />,
    primaryColor: 'var(--brandBackground)',
    secondaryColor: 'var(--brandSecondary)',
    borderBox: '1px solid var(--brandSecondary)',
  },
  error: {
    icon: <ErrorOutlineIcon style={{ fontSize: '24px', color: 'var(--errorSecondary)' }} />,
    primaryColor: 'var(--errorLight)',
    secondaryColor: 'var(--errorSecondary)',
    borderBox: '1px solid var(--errorSecondary)',
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
  const {
    icon,
    primaryColor,
    secondaryColor,
    borderBox,
  } = alertTypes[type];

  return (
    <Box
      className={[classes.box, 'alert'].join(' ')}
      style={{
        background: primaryColor,
        border: hasBorder ? borderBox : null,
        boxShadow: hasBorder ? '0 4px 16px rgba(0, 0, 0, 0.1)' : null,
      }}
      display="flex"
      alignItems="flex-start"
    >
      { icon ? <Box mr={1}>{icon}</Box> : null }
      <Box>
        <Typography variant="subtitle2" style={{ color: secondaryColor }}>
          {title}
        </Typography>
        { content ?
          <Typography
            variant="body1"
            className={[classes.content, 'alert-content'].join(' ')}
            style={{ color: secondaryColor }}
          >
            {content}
          </Typography>
          : null }
        { buttonLabel ?
          <Button
            className={classes.smallButton}
            style={{ background: secondaryColor }}
            variant="contained"
            onClick={onButtonClick}
          >
            {buttonLabel}
          </Button>
          : null }
      </Box>
      { onClose ?
        <Box>
          <Tooltip title={
            <FormattedMessage
              id="alert.closeButton"
              defaultMessage="Close alert"
              description="Tooltip for close alert"
            />
          }
          >
            <IconButton
              className={classes.closeButton}
              style={{ color: secondaryColor }}
              onClick={onClose}
            >
              <IconClose />
            </IconButton>
          </Tooltip>
        </Box>
        : null }
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
