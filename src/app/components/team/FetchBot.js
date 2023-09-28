import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

const FetchBot = ({
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
      <FormControlLabel
        control={<Checkbox
          checked={value.auto_publish_reports}
          onChange={() => handleChange('auto_publish_reports')}
          name="checkedA"
        />}
        label={intl.formatMessage({
          id: 'fetchBot.autoPublish',
          defaultMessage: 'Auto-publish reports',
          description: 'Label for a setting that causes a bot to automatically publish its reports in the workspace',
        })}
      />
      <p>
        <a href="https://airtable.com/shrlr5jDk7z6bvE5W" target="_blank" rel="noopener noreferrer">
          <FormattedMessage
            id="fetchBot.contactUs"
            defaultMessage="Contact us to set up"
            description="Link text for a contact us link"
          />
        </a>
      </p>
    </>
  );
};

export default injectIntl(FetchBot);
