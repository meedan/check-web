import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import { labels, descriptions, placeholders } from './localizables';

const useStyles = makeStyles(theme => ({
  textarea: {
    marginTop: theme.spacing(2),
  },
}));

const SmoochBotTextEditor = (props) => {
  const classes = useStyles();
  const { field } = props;

  const handleChange = (event) => {
    props.onChange(event.target.value);
  };

  const value = props.value || props.intl.formatMessage(placeholders[field]);

  return (
    <React.Fragment>
      <Typography variant="subtitle2" component="div">{labels[field]}</Typography>
      <Typography component="div">{descriptions[field]}</Typography>
      <TextField
        key={value}
        className={classes.textarea}
        defaultValue={value}
        placeholder={value}
        onBlur={handleChange}
        variant="outlined"
        rows="12"
        fullWidth
        multiline
      />
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
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  intl: intlShape.isRequired,
};

export default injectIntl(SmoochBotTextEditor);
