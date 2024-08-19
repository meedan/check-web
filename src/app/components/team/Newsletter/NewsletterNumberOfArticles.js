import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { ToggleButton, ToggleButtonGroup } from '../../cds/inputs/ToggleButtonGroup';

const NewsletterNumberOfArticles = ({
  disabled,
  number,
  onChangeNumber,
  options,
}) => (
  <ToggleButtonGroup
    label={
      <FormattedMessage
        id="newsletterNumberOfArticles.label"
        defaultMessage="Number of articles"
        description="Label on an input where the user selects the number of articles to display in their newsletter"
      />
    }
    helpContent={
      <FormattedMessage
        id="newsletterNumberOfArticles.helpContent"
        defaultMessage="Choose the number of articles that will be published in your newsletter"
        description="Help context description on an input where the user selects the number of articles to display in their newsletter"
      />
    }
    variant="contained"
    value={number}
    onChange={(e, newValue) => { onChangeNumber(newValue); }}
    exclusive
  >
    {options.map(option => (
      <ToggleButton value={option} key={option} disabled={disabled}>
        {option}
      </ToggleButton>
    ))}
  </ToggleButtonGroup>
);

NewsletterNumberOfArticles.defaultProps = {
  disabled: false,
};

NewsletterNumberOfArticles.propTypes = {
  disabled: PropTypes.bool,
  number: PropTypes.number.isRequired,
  options: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
  onChangeNumber: PropTypes.func.isRequired,
};

export default NewsletterNumberOfArticles;
