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
    id="sharedItemCard.requests"
    // {requestsCount, number} tells react-intl to format the number as Intl.NumberFormat(locale, {})
    defaultMessage="{requestsCount, plural, one {# Request} other {{requestsCount, number} Requests}}"
    description="A count of requests for an item. Title-case where applicable. Example: 3 Requests"
    values={{ requestsCount }}
  >
    { requestsLabel => (
      <Tooltip
        arrow
        title={requestsLabel}
        placement="top"
      >
        <span>
          <ButtonMain
            disabled
            size="small"
            theme="brand"
            iconLeft={<RequestsIcon />}
            variant="contained"
            label={getCompactNumber(intl.locale, requestsCount)}
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
