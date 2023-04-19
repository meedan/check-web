import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import {
  Box,
  Typography,
  TextField,
} from '@material-ui/core';

const StyledTextField = withStyles({
  root: {
    '& .MuiOutlinedInput-input::placeholder': {
      color: 'var(--textSecondary)',
      opacity: 1,
    },
    '& .MuiFormHelperText-root.Mui-error': {
      color: 'var(--errorMain)',
      marginLeft: 0,
      fontSize: 12,
      fontWeight: 400,
    },
    '& .MuiOutlinedInput-root': {
      '&.Mui-error .MuiOutlinedInput-notchedOutline': {
        borderColor: 'var(--errorMain)',
      },
      '& fieldset': {
        borderColor: 'var(--grayBorderMain)',
        borderWidth: 1,
      },
      '&:hover fieldset': {
        borderColor: 'var(--grayBorderMain)',
        borderWidth: 1,
      },
      '&.Mui-focused fieldset': {
        borderColor: 'var(--grayBorderMain)',
        borderWidth: 1,
      },
    },
  },
})(TextField);

const useStyles = makeStyles(theme => ({
  // FIXME: Once Typography is implemented according to specs from the design system, this custom style can be removed
  title: {
    fontWeight: 600,
    fontSize: 14,
  },
  // FIXME: Once Typography is implemented according to specs from the design system, this custom style can be removed
  description: {
    fontWeight: 400,
    fontSize: 12,
  },
  defaultString: {
    borderTopLeftRadius: theme.spacing(1),
    borderTopRightRadius: theme.spacing(1),
    border: '1px solid var(--grayBorderMain)',
    borderBottom: 0,
    background: 'var(--brandBackground)',
    padding: '12px 10px',
  },
  // FIXME: Once Typography is implemented according to specs from the design system, this custom style can be removed
  default: {
    fontWeight: 400,
    fontSize: 14,
  },
  customString: {
    borderTop: 0,
    outline: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    fontSize: 14,
    fontWeight: 400,
    color: 'var(--textPrimary)',
  },
}));

const messages = defineMessages({
  placeholder: {
    id: 'smoochBotContentAndTranslation.placeholder',
    defaultMessage: 'Type custom content or translation here.',
    description: 'Placeholder used in all fields under tipline content and translation settings.',
  },
});

const TiplineContentTranslation = ({
  intl,
  identifier,
  title,
  description,
  defaultValue,
  onUpdate,
  value,
  error,
  extra,
}) => {
  const classes = useStyles();
  return (
    <Box>

      {/* Text and description about this field */}
      <Typography variant="body1" className={classes.title}>
        {title}
      </Typography>
      <Typography variant="body1" className={classes.description}>
        {description}
      </Typography>

      <Box mt={1}>

        {/* Default value */}
        <Box p={1} className={classes.defaultString}>
          <Typography variant="body1" className={classes.default}>
            {defaultValue}
          </Typography>
        </Box>

        {/* Text field for custom value */}
        <StyledTextField
          key={identifier}
          InputProps={{ className: classes.customString }}
          variant="outlined"
          placeholder={intl.formatMessage(messages.placeholder)}
          rowsMax={Infinity}
          rows={1}
          defaultValue={value}
          onBlur={(e) => { onUpdate(e.target.value); }}
          error={Boolean(error)}
          helperText={error}
          multiline
          fullWidth
        />

        {extra}

      </Box>
    </Box>
  );
};

TiplineContentTranslation.defaultProps = {
  value: null, // Custom value
  error: null,
  extra: null,
};

TiplineContentTranslation.propTypes = {
  intl: intlShape.isRequired,
  identifier: PropTypes.string.isRequired,
  title: PropTypes.node.isRequired,
  description: PropTypes.node.isRequired,
  defaultValue: PropTypes.node.isRequired,
  onUpdate: PropTypes.func.isRequired,
  value: PropTypes.string,
  error: PropTypes.node,
  extra: PropTypes.node,
};

export default injectIntl(TiplineContentTranslation);
