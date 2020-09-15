import React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';

const FetchBot = () => {
  const handleOpenForm = () => {
    window.open('https://airtable.com/shrlr5jDk7z6bvE5W');
  };

  return (
    <Button
      variant="contained"
      color="primary"
      onClick={handleOpenForm}
    >
      <FormattedMessage
        id="fetchBot.contactUs"
        defaultMessage="Contact us to setup"
      />
    </Button>
  );
};

export default FetchBot;
