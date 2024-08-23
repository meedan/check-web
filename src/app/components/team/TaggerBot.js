import React from 'react';
import { injectIntl } from 'react-intl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Checkbox from '@material-ui/core/Checkbox';
import TextField from '../cds/inputs/TextField';

const TaggerBot = ({
  intl,
  onChange,
  value,
}) => {
  function handleChange(field, val) {
    const data = { ...value };
    if (field === 'ignore_autotags') {
      data[field] = !data[field];
    } else {
      data[field] = parseInt(val, 10);
    }
    onChange(data);
  }

  return (
    <>
      <FormGroup>
        <FormControlLabel
          control={<TextField
            name="threshold"
            type="number"
            value={value.threshold}
            onChange={e => handleChange('threshold', e.target.value)}
          />}
          label={intl.formatMessage({
            id: 'taggerBot.threshold',
            defaultMessage: 'Threshold (0-100, default of 70)',
            description: 'Search similarity threshold (0-100)',
          })}
        />
        <FormControlLabel
          control={<TextField
            name="minimum_count"
            type="number"
            value={value.minimum_count}
            onChange={e => handleChange('minimum_count', e.target.value)}
          />}
          label={intl.formatMessage({
            id: 'taggerBot.minimum_count',
            defaultMessage: 'Minimum count',
            description: 'Minimum number of times a tag must appear to be applied',
          })}
        />
        <FormControlLabel
          control={<Checkbox
            checked={value.ignore_autotags}
            name="ignore_autotags"
            onChange={e => handleChange('ignore_autotags', e.target.value)}
          />}
          label={intl.formatMessage({
            id: 'taggerBot.ignore_autotags',
            defaultMessage: 'Ignore auto-tags?',
            description: 'If enabled, autotags will not be considered in finding the most common tag',
          })}
          minimum_count
        />
      </FormGroup>
    </>
  );
};

export default injectIntl(TaggerBot);
