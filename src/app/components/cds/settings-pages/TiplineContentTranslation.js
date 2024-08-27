/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import {
  Box,
  TextField,
} from '@material-ui/core';
import styles from '../../team/Settings.module.css';

const StyledTextField = withStyles({
  root: {
    '& .MuiOutlinedInput-input::placeholder': {
      color: 'var(--color-gray-37)',
      opacity: 1,
    },
    '& .MuiFormHelperText-root.Mui-error': {
      color: 'var(--color-pink-53)',
      marginLeft: 0,
      fontSize: 12,
      fontWeight: 400,
    },
    '& .MuiOutlinedInput-root': {
      '&.Mui-error .MuiOutlinedInput-notchedOutline': {
        borderColor: 'var(--color-pink-53)',
      },
      '& fieldset': {
        borderColor: 'var(--color-gray-88)',
        borderWidth: 1,
      },
      '&:hover fieldset': {
        borderColor: 'var(--color-gray-88)',
        borderWidth: 1,
      },
      '&.Mui-focused fieldset': {
        borderColor: 'var(--color-gray-88)',
        borderWidth: 1,
      },
    },
  },
})(TextField);

const useStyles = makeStyles(theme => ({
  defaultString: {
    borderTopLeftRadius: theme.spacing(1),
    borderTopRightRadius: theme.spacing(1),
    border: '1px solid var(--color-gray-88)',
    borderBottom: 0,
    background: 'var(--color-beige-93)',
    padding: '12px 10px',
  },
  customString: {
    borderTop: 0,
    outline: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    fontSize: 14,
    fontWeight: 400,
    color: 'var(--color-gray-15)',
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
  defaultValue,
  description,
  error,
  extra,
  identifier,
  intl,
  onUpdate,
  title,
  value,
}) => {
  const classes = useStyles();
  return (
    <Box>

      {/* Text and description about this field */}
      <div className={styles['setting-content-container-title']}>
        {title}
      </div>
      <p>
        {description}
      </p>

      <Box mt={1}>

        {/* Default value */}
        <Box className={classes.defaultString} p={1}>
          {defaultValue}
        </Box>

        {/* Text field for custom value */}
        <StyledTextField
          InputProps={{ className: classes.customString }}
          defaultValue={value}
          error={Boolean(error)}
          fullWidth
          helperText={error}
          key={identifier}
          multiline
          placeholder={intl.formatMessage(messages.placeholder)}
          rows={1}
          rowsMax={Infinity}
          variant="outlined"
          onBlur={(e) => { onUpdate(e.target.value); }}
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
