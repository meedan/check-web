import React from 'react';
import { injectIntl } from 'react-intl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Checkbox from '@material-ui/core/Checkbox';

const KeepBot = ({
  intl,
  onChange,
  value,
}) => {
  function handleChange(field) {
    const data = { ...value };
    data[field] = !data[field];
    onChange(data);
  }

  return (
    <>
      <FormGroup>
        <FormControlLabel
          control={<Checkbox
            checked={value.archive_archive_org_enabled}
            name="checkedB"
            onChange={() => handleChange('archive_archive_org_enabled')}
          />}
          label={intl.formatMessage({
            id: 'keepBot.archiveOrg',
            defaultMessage: 'Enable Archive.org',
            description: 'Label for a setting that causes a bot to enable the "Archive.org" service (name of a third party provider, should not be localized)',
          })}
        />
        <FormControlLabel
          control={<Checkbox
            checked={value.archive_perma_cc_enabled}
            name="checkedC"
            onChange={() => handleChange('archive_perma_cc_enabled')}
          />}
          label={intl.formatMessage({
            id: 'keepBot.permaCc',
            defaultMessage: 'Enable Perma.cc',
            description: 'Label for a setting that causes a bot to enable the "Perma.cc" service (name of a third party provider, should not be localized)',
          })}
        />
      </FormGroup>
    </>
  );
};

export default injectIntl(KeepBot);
