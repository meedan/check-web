/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import { labels, descriptions, placeholders, footnotes } from './localizables';
import TextField from '../../cds/inputs/TextField';

const useStyles = makeStyles(theme => ({
  textarea: {
    marginTop: theme.spacing(2),
  },
}));

const ValueOrPlaceholder = ({ children, field, value }) => (value || !placeholders[field])
  ? children(value)
  : <FormattedMessage {...placeholders[field]}>{children}</FormattedMessage>; // eslint-disable-line @calm/react-intl/missing-attribute

const SmoochBotTextEditor = (props) => {
  const classes = useStyles();
  const { field, value } = props;

  const handleChange = (event) => {
    props.onChange(event.target.value);
  };

  return (
    <React.Fragment>
      { labels[field] ? <div className="typography-subtitle2">{labels[field]}</div> : null }
      { descriptions[field] ? <div>{descriptions[field]}</div> : null }
      <ValueOrPlaceholder field={field} value={value}>
        {valueOrPlaceholder => (
          <TextField
            className={classes.textarea}
            defaultValue={valueOrPlaceholder}
            error={Boolean(props.errorMessage)}
            fullWidth
            helperText={props.errorMessage}
            key={valueOrPlaceholder}
            multiline
            name={field}
            placeholder={valueOrPlaceholder}
            rows="12"
            rowsMax={Infinity}
            variant="outlined"
            onBlur={handleChange}
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
