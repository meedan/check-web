import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import Tooltip from '../../cds/alerts-and-prompts/Tooltip';
import RequestsIcon from '../../../icons/question_answer.svg';
import { getCompactNumber, getSeparatedNumber } from '../../../helpers';

const RequestsCount = ({
  intl,
  requestsCount,
}) => (
  <FormattedMessage id="sharedItemCard.requests" defaultMessage="Requests" description="This appears as a label next to a number, like '1,234 Requests'. It should indicate to the user that whatever number they are viewing represents the number of requests an item has gotten.">
    { requestsLabel => (
      <Tooltip
        arrow
        title={`${getSeparatedNumber(intl.locale, requestsCount)} ${requestsLabel}`}
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
