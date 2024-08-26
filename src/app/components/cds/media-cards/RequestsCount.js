import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import Tooltip from '../../cds/alerts-and-prompts/Tooltip';
import RequestsIcon from '../../../icons/question_answer.svg';
import { getCompactNumber } from '../../../helpers';

const RequestsCount = ({
  intl,
  requestsCount,
}) => (
  <FormattedMessage
    defaultMessage="{requestsCount, plural, one {# Request} other {{requestsCount, number} Requests}}"
    // {requestsCount, number} tells react-intl to format the number as Intl.NumberFormat(locale, {})
    description="A count of requests for an item. Title-case where applicable. Example: 3 Requests"
    id="sharedItemCard.requests"
    values={{ requestsCount }}
  >
    { requestsLabel => (
      <Tooltip
        arrow
        placement="top"
        title={requestsLabel}
      >
        <span>
          <ButtonMain
            buttonProps={{
              type: null,
            }}
            disabled
            iconLeft={<RequestsIcon />}
            label={getCompactNumber(intl.locale, requestsCount)}
            size="small"
            theme="lightBeige"
            variant={requestsCount === 0 ? 'text' : 'contained'}
          />
        </span>
      </Tooltip>
    )}
  </FormattedMessage>
);

RequestsCount.propTypes = {
  intl: intlShape.isRequired,
  requestsCount: PropTypes.number.isRequired,
};

export default injectIntl(RequestsCount);
