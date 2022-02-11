/* eslint-disable @calm/react-intl/missing-attribute */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import { labels, descriptions, placeholders, footnotes } from './localizables';

const useStyles = makeStyles(theme => ({
  textarea: {
    marginTop: theme.spacing(2),
  },
}));

const ValueOrPlaceholder = ({ value, field, children }) => (value || !placeholders[field])
  ? children(value)
  : <FormattedMessage {...placeholders[field]}>{children}</FormattedMessage>;

const SmoochBotTextEditor = (props) => {
  const classes = useStyles();
  const { value, field } = props;

  const handleChange = (event) => {
    props.onChange(event.target.value);
  };

  return (
    <React.Fragment>
      { labels[field] ? <Typography variant="subtitle2" component="div">{labels[field]}</Typography> : null }
      { descriptions[field] ? <Typography component="div">{descriptions[field]}</Typography> : null }
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
      { footnotes[field] ? <Typography component="div">{footnotes[field]}</Typography> : null }
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
