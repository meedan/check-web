import React from 'react';
import PropTypes from 'prop-types';
import Paper from '@material-ui/core/Paper';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  paper: {
    width: '100%',
    padding: theme.spacing(2),
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    boxShadow: 'none',
    border: 0,
  },
  inner: {
    margin: 0,
    padding: 0,
    marginBottom: theme.spacing(2),
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

  const handleSelect = (newValue) => {
    props.onChange(newValue);
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
    <Paper className={[classes.paper, props.className, 'rules__rule-field'].join(' ')}>
      { options ?
        <Autocomplete
          label={label}
          value={options.find(option => option.key === props.value)}
          onChange={(event, newValue) => {
            if (newValue) {
              handleSelect(newValue.key);
            }
          }}
          options={options.sort((a, b) => (a.value.localeCompare(b.value)))}
          getOptionLabel={option => option.value}
          renderInput={params => <TextField {...params} variant="outlined" label={label} fullWidth />}
          fullWidth
        /> : null }
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
                className={classes.inner}
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
          { props.definition.allOf ?
            <React.Fragment>
              {props.definition.allOf.map((condition) => {
                const fieldName = Object.keys(condition.if.properties)[0];
                if (value[fieldName] === condition.if.properties[fieldName].const) {
                  const subFieldName = Object.keys(condition.then.properties)[0];
                  const subSubDefinition = condition.then.properties[subFieldName];
                  const subSubValue = value[subFieldName] || '';
                  return (
                    <RuleField
                      className={classes.inner}
                      key={`${fieldName}-${subFieldName}`}
                      definition={subSubDefinition}
                      value={subSubValue}
                      onChange={(newSubSubValue) => {
                        const newSubValue = Object.assign({}, value);
                        newSubValue[subFieldName] = newSubSubValue;
                        setValue(newSubValue);
                        props.onChange(newSubValue);
                      }}
                    />
                  );
                }
                return null;
              })}
            </React.Fragment> : null }
        </React.Fragment> : null }
    </Paper>
  );
};

RuleField.defaultProps = {
  value: null,
  className: '',
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
  className: PropTypes.string,
};

export default RuleField;
