import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '../../cds/inputs/TextField';
import { labels, descriptions, placeholders, footnotes } from './localizables';

const useStyles = makeStyles(theme => ({
  textarea: {
    marginTop: theme.spacing(2),
  },
}));

const ValueOrPlaceholder = ({ value, field, children }) => (value || !placeholders[field])
  ? children(value)
  : <FormattedMessage {...placeholders[field]}>{children}</FormattedMessage>; // eslint-disable-line @calm/react-intl/missing-attribute

const SmoochBotTextEditor = (props) => {
  const classes = useStyles();
  const { value, field } = props;

  const handleChange = (event) => {
    props.onChange(event.target.value);
  };

  return (
    <React.Fragment>
      { labels[field] ? <div className="typography-subtitle2">{labels[field]}</div> : null }
      { descriptions[field] ? <div>{descriptions[field]}</div> : null }
      <ValueOrPlaceholder value={value} field={field}>
        {valueOrPlaceholder => (
          <TextField
            key={valueOrPlaceholder}
            name={field}
            className={classes.textarea}
            defaultValue={valueOrPlaceholder}
            placeholder={valueOrPlaceholder}
            onBlur={handleChange}
            variant="outlined"
            rows="12"
            rowsMax={Infinity}
            error={Boolean(props.errorMessage)}
            helperText={props.errorMessage}
            fullWidth
            multiline
            {...props.extraTextFieldProps}
          />
        )}
      </ValueOrPlaceholder>
      { footnotes[field] ? <div>{footnotes[field]}</div> : null }
    </React.Fragment>
  );
};

SmoochBotTextEditor.defaultProps = {
  value: null,
  errorMessage: null,
  extraTextFieldProps: {},
};

SmoochBotTextEditor.propTypes = {
  value: PropTypes.string,
  field: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  extraTextFieldProps: PropTypes.object,
  errorMessage: PropTypes.object,
};

export default SmoochBotTextEditor;
