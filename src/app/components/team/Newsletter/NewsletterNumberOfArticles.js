import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { ToggleButton, ToggleButtonGroup } from '../../cds/inputs/ToggleButtonGroup';

const NewsletterNumberOfArticles = ({
  number,
  options,
  onChangeNumber,
}) => (
  <ToggleButtonGroup
    label={
      <FormattedMessage
        id="newsletterNumberOfArticles.label"
        defaultMessage="Number of articles"
        description="Label on an input where the user selects the number of articles to display in their newsletter"
      />
    }
    variant="contained"
    value={number}
    onChange={(e, newValue) => { onChangeNumber(newValue); }}
    exclusive
  >
    {options.map(option => (
      <ToggleButton value={option} key={option}>
        {option}
      </ToggleButton>
    ))}
  </ToggleButtonGroup>
);

NewsletterNumberOfArticles.propTypes = {
  number: PropTypes.number.isRequired,
  options: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
  onChangeNumber: PropTypes.func.isRequired,
};

export default NewsletterNumberOfArticles;
