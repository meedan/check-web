import React from 'react';
import PropTypes from 'prop-types';
import Paper from '@material-ui/core/Paper';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import { black54 } from '../../../styles/js/shared';

const useStyles = makeStyles(theme => ({
  paper: {
    width: '100%',
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    boxShadow: 'none',
    border: `2px solid ${black54}`,
  },
}));

const RuleField = (props) => {
  const classes = useStyles();
  const [value, setValue] = React.useState(props.value);
  const label = props.definition.title;
  const { type } = props.definition;
  const options = props.definition.enum;

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  const handleBlur = () => {
    props.onChange(value);
  };

  const handleSelect = (event) => {
    props.onChange(event.target.value);
  };

  const inputProps = {};
  if (type === 'integer') {
    inputProps.step = 1;
  }
  if (props.definition.minimum) {
    inputProps.min = props.definition.minimum;
  }
  if (props.definition.maximum) {
    inputProps.max = props.definition.maximum;
  }

  return (
    <Paper className={[classes.paper, 'rules__rule-field'].join(' ')}>
      { options ?
        <FormControl variant="outlined" fullWidth>
          <InputLabel>{label}</InputLabel>
          <Select
            value={props.value}
            label={label}
            onChange={handleSelect}
            MenuProps={{ autoFocus: false, disableScrollLock: true }}
          >
            {options.map(option => (
              <MenuItem value={option.key} key={option.key}>{option.value}</MenuItem>
            ))}
          </Select>
        </FormControl> : null }
      { type === 'string' && !options ?
        <TextField
          value={value}
          label={label}
          onChange={handleChange}
          onBlur={handleBlur}
          variant="outlined"
          rows="4"
          fullWidth
          multiline
        /> : null }
      { (type === 'integer' || type === 'number') && !options ?
        <TextField
          value={value}
          type="number"
          label={label}
          onChange={handleChange}
          onBlur={handleBlur}
          variant="outlined"
          inputProps={inputProps}
          fullWidth
        /> : null }
      { type === 'object' ?
        <React.Fragment>
          {Object.keys(props.definition.properties).map((field) => {
            const subDefinition = props.definition.properties[field];
            const subValue = value[field] || '';
            return (
              <RuleField
                key={field}
                definition={subDefinition}
                value={subValue}
                onChange={(newSubValue) => {
                  const newValue = Object.assign({}, value);
                  newValue[field] = newSubValue;
                  setValue(newValue);
                  props.onChange(newValue);
                }}
              />
            );
          })}
        </React.Fragment> : null }
    </Paper>
  );
};

RuleField.defaultProps = {
  value: null,
};

RuleField.propTypes = {
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.object,
  ]),
  definition: PropTypes.shape({
    title: PropTypes.string,
    type: PropTypes.string.isRequired,
    enum: PropTypes.arrayOf(PropTypes.shape({
      key: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]).isRequired,
      value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]).isRequired,
    })),
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default RuleField;
