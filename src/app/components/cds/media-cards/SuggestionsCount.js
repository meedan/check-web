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
    defaultMessage="{suggestionsCount, plural, one {# Suggestion} other {{suggestionsCount, number} Suggestions}}"
    // {suggestionsCount, number} tells react-intl to format the number as Intl.NumberFormat(locale, {})
    description="A count of suggestions for an item. Title-case where applicable. Example: 3 Suggestions"
    id="suggestionsCount.suggestions"
    values={{ suggestionsCount }}
  >
    { suggestionsLabel => (
      <Tooltip
        arrow
        placement="top"
        title={suggestionsLabel}
      >
        <span>
          <ButtonMain
            buttonProps={{
              type: null,
            }}
            disabled
            iconLeft={<SuggestionsIcon />}
            label={getCompactNumber(intl.locale, suggestionsCount)}
            size="small"
            theme={suggestionsCount === 0 ? 'lightBeige' : 'alert'}
            variant={suggestionsCount === 0 ? 'text' : 'contained'}
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
