/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import Autocomplete from '@material-ui/lab/Autocomplete';
import cx from 'classnames/bind';
import TextField from '../../cds/inputs/TextField';
import inputStyles from '../../../styles/css/inputs.module.css';

const RuleField = (props) => {
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
    <div className={cx(props.className, 'rules__rule-field', inputStyles['form-fieldset-field'])}>
      { options ?
        <Autocomplete
          getOptionLabel={option => option.value}
          label={label}
          options={label === 'With a likelihood of at least' ? options : options.sort((a, b) => (a.value.localeCompare(b.value)))}
          renderInput={params => (
            <div ref={params.InputProps.ref}>
              <TextField
                label={label}
                placeholder={label}
                {...params.inputProps}
              />
            </div>
          )}
          value={options.find(option => option.key === props.value)}
          onChange={(event, newValue) => {
            if (newValue) {
              handleSelect(newValue.key);
            }
          }}
        /> : null }
      { type === 'string' && !options ?
        <TextField
          className="int-rules__rule-field-string-input"
          label={label}
          value={value}
          onBlur={handleBlur}
          onChange={handleChange}
        /> : null }
      { (type === 'integer' || type === 'number') && !options ?
        <TextField
          componentProps={inputProps}
          label={label}
          type="number"
          value={value}
          onBlur={handleBlur}
          onChange={handleChange}
        /> : null }
      { type === 'object' ?
        <React.Fragment>
          {Object.keys(props.definition.properties).map((field) => {
            const subDefinition = props.definition.properties[field];
            const subValue = value[field] || '';
            return (
              <RuleField
                definition={subDefinition}
                key={field}
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
                      definition={subSubDefinition}
                      key={`${fieldName}-${subFieldName}`}
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
    </div>
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
