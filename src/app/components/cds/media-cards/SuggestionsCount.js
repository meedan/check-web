import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import Tooltip from '../../cds/alerts-and-prompts/Tooltip';
import SuggestionsIcon from '../../../icons/lightbulb.svg';
import { getCompactNumber } from '../../../helpers';

const SuggestionsCount = ({
  intl,
  suggestionsCount,
}) => (
  <FormattedMessage
    id="suggestionsCount.suggestions"
    // {suggestionsCount, number} tells react-intl to format the number as Intl.NumberFormat(locale, {})
    defaultMessage="{suggestionsCount, plural, one {# Suggestion} other {{suggestionsCount, number} Suggestions}}"
    description="A count of suggestions for an item. Title-case where applicable. Example: 3 Suggestions"
    values={{ suggestionsCount }}
  >
    { suggestionsLabel => (
      <Tooltip
        arrow
        title={suggestionsLabel}
        placement="top"
      >
        <span>
          <ButtonMain
            disabled
            size="small"
            theme={suggestionsCount === 0 ? 'lightBeige' : 'lightAlert'}
            iconLeft={<SuggestionsIcon />}
            variant={suggestionsCount === 0 ? 'text' : 'contained'}
            label={getCompactNumber(intl.locale, suggestionsCount)}
            buttonProps={{
              type: null,
            }}
          />
        </span>
      </Tooltip>
    )}
  </FormattedMessage>
);

SuggestionsCount.propTypes = {
  intl: intlShape.isRequired,
  suggestionsCount: PropTypes.number.isRequired,
};

export default injectIntl(SuggestionsCount);
