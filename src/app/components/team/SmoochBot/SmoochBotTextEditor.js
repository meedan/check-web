import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import { labels, descriptions, placeholders } from './localizables';

const useStyles = makeStyles(theme => ({
  textarea: {
    marginTop: theme.spacing(2),
  },
}));

const ValueOrPlaceholder = ({ value, field, children }) => value
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
      <Typography variant="subtitle2" component="div">{labels[field]}</Typography>
      <Typography component="div">{descriptions[field]}</Typography>
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
            fullWidth
            multiline
          />
        )}
      </ValueOrPlaceholder>
    </React.Fragment>
  );
};

SmoochBotTextEditor.defaultProps = {
  value: null,
};

SmoochBotTextEditor.propTypes = {
  value: PropTypes.string,
  field: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default SmoochBotTextEditor;
