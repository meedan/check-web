import React from 'react';
import PropTypes from 'prop-types';
import ErrorIcon from '@material-ui/icons/Error';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import {
  MuiTheme,
  body1,
  body2,
  brandMain,
  caption,
  errorMain,
  errorSecondary,
  grayBorderAccent,
  grayBorderMain,
  grayDisabledBackground,
  otherWhite,
  textDisabledInput,
  textPlaceholder,
  textPrimary,
  textSecondary,
} from '../../../styles/js/shared';

const useStyles = makeStyles(theme => ({
  input: {
    ...MuiTheme.typography.body1,
    font: body1,
    width: '100%',
    padding: theme.spacing(1.5, 1.25),
    height: '100%',
    color: textPrimary,
    backgroundColor: otherWhite,
    borderRadius: theme.spacing(1),
    border: `${theme.spacing(0.25)}px solid ${grayBorderMain}`,
    '&:hover': {
      borderColor: grayBorderAccent,
    },
    '&:focus': {
      outline: 'none',
      borderColor: brandMain,
      '&::placeholder': {
        color: 'transparent',
      },
    },
    '&::placeholder': {
      color: textPlaceholder,
    },
  },
  labelContainer: {
    ...MuiTheme.typography.body2,
    font: body2,
    color: textSecondary,
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gridGap: theme.spacing(1),
    marginBottom: theme.spacing(0.5),
  },
  label: {
    marginLeft: theme.spacing(1.25),
    alignSelf: 'end',
  },
  required: {
    textAlign: 'right',
    marginRight: theme.spacing(0.5),
    alignSelf: 'end',
  },
  disabled: {
    color: textDisabledInput,
    backgroundColor: grayDisabledBackground,
  },
  errorLabel: {
    color: errorSecondary,
  },
  error: {
    borderColor: errorMain,
    '&:hover': {
      borderColor: errorSecondary,
    },
    '&:focus': {
      borderColor: errorMain,
    },
  },
  outlined: {
    backgroundColor: 'transparent',
  },
  inputContainer: {
    position: 'relative',
  },
  inputIconLeftIcon: {
    position: 'absolute',
    color: textSecondary,
    padding: '13.5px 0 13.5px 11.5px',
    '& svg': {
      width: '17.5px',
      height: '17.5px',
    },
  },
  inputIconLeft: {
    paddingLeft: '34px',
  },
  inputIconRight: {
    paddingRight: '34px',
  },
  inputIconRightIcon: {
    position: 'absolute',
    color: textSecondary,
    right: '11.5px',
    top: '13.5px',
    '& svg': {
      width: '17.5px',
      height: '17.5px',
    },
  },
  helpContainer: {
    ...MuiTheme.typography.caption,
    font: caption,
    padding: theme.spacing(0, 0.5, 0, 1.25),
  },
  errorIcon: {
    position: 'relative',
    width: '12.5px',
    height: '12.5px',
    marginRight: theme.spacing(0.5),
    top: '1.5px',
  },
}));

const TextField = ({
  disabled,
  error,
  helpContent,
  iconLeft,
  iconRight,
  label,
  required,
  variant,
  textArea,
  ...inputProps
}) => {
  const classes = useStyles();
  return (
    <>
      { (label || required) && (
        <div className={`${classes.labelContainer} ${error && classes.errorLabel}`} >
          <div className={classes.label} >
            { label && <label htmlFor="name">{label}</label> }
          </div>
          <div className={classes.required} >
            { required && <span>*<FormattedMessage id="textfield.required" defaultMessage="Required" description="A label to indicate that a form field must be filled out" /></span>}
          </div>
        </div>
      )}
      <div className={classes.inputContainer}>
        { iconLeft && (
          <div className={classes.inputIconLeftIcon}>
            {iconLeft}
          </div>
        )}
        { textArea ? (
          <textarea
            className={`${classes.input} ${disabled && classes.disabled} ${error && classes.error} ${variant === 'outlined' && classes.outlined} ${iconLeft && classes.inputIconLeft} ${iconLeft && classes.inputIconLeft} ${iconRight && classes.inputIconRight}`}
            type="text"
            disabled={disabled}
            error={error}
            {...inputProps}
          />
        ) : (
          <input
            className={`${classes.input} ${disabled && classes.disabled} ${error && classes.error} ${variant === 'outlined' && classes.outlined} ${iconLeft && classes.inputIconLeft} ${iconLeft && classes.inputIconLeft} ${iconRight && classes.inputIconRight}`}
            type="text"
            disabled={disabled}
            error={error}
            {...inputProps}
          />
        )}
        { iconRight && (
          <div className={classes.inputIconRightIcon}>
            {iconRight}
          </div>
        )}
      </div>
      { helpContent && (
        <div className={`${classes.helpContainer} ${error && classes.errorLabel}`}>
          { error && <ErrorIcon className={classes.errorIcon} />}
          {helpContent}
        </div>
      )}
    </>
  );
};

TextField.defaultProps = {
  disabled: false,
  error: false,
  helpContent: null,
  iconLeft: null,
  iconRight: null,
  label: '',
  required: false,
  textArea: false,
  variant: 'contained',
};

TextField.propTypes = {
  disabled: PropTypes.bool,
  error: PropTypes.bool,
  helpContent: PropTypes.element,
  iconLeft: PropTypes.element,
  iconRight: PropTypes.element,
  label: PropTypes.string,
  required: PropTypes.bool,
  textArea: PropTypes.bool,
  variant: PropTypes.oneOf(['contained', 'outlined']),
};

export default TextField;
