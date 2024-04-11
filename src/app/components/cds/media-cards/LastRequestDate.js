import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedDate, injectIntl, intlShape } from 'react-intl';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import Tooltip from '../../cds/alerts-and-prompts/Tooltip';
import CalendarMonthIcon from '../../../icons/calendar_month.svg';

const LastRequestDate = ({
  intl,
  lastRequestDate,
}) => (
  <FormattedMessage id="sharedItemCard.lastRequested" defaultMessage="Last Requested" description="This appears as a label before a date with a colon between them, like 'Last Requested: May 5, 2023'.">
    { lastRequestDateLabel => (
      <Tooltip
        arrow
        title={(
          <>
            <span>{lastRequestDateLabel}:</span>
            <ul>
              <li>{Intl.DateTimeFormat(intl.locale, { year: 'numeric', month: 'long', day: 'numeric' }).format(lastRequestDate)}</li>
              <li>{Intl.DateTimeFormat(intl.locale, { hour: 'numeric', minute: 'numeric' }).format(lastRequestDate)}</li>
            </ul>
          </>
        )}

        placement="top"
      >
        <span>
          <ButtonMain
            disabled
            size="small"
            theme="brand"
            iconLeft={<CalendarMonthIcon />}
            variant="contained"
            label={<FormattedDate value={lastRequestDate} year="numeric" month="long" day="numeric" />}
          />
        </span>
      </Tooltip>
    )}
  </FormattedMessage>
);

LastRequestDate.propTypes = {
  intl: intlShape.isRequired,
  lastRequestDate: PropTypes.instanceOf(Date).isRequired,
};

export default injectIntl(LastRequestDate);
