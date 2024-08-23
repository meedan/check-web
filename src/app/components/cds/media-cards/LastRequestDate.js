/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedDate, injectIntl, intlShape } from 'react-intl';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import Tooltip from '../../cds/alerts-and-prompts/Tooltip';
import CalendarMonthIcon from '../../../icons/calendar_month.svg';

// TODO: Refactor to make it an any date component. Rename to ItemDateButton maybe?.
const LastRequestDate = ({
  intl,
  lastRequestDate,
  theme,
  tooltip,
  tooltipLabel,
  variant,
}) => {
  const buttonContent = (
    <span>
      <ButtonMain
        buttonProps={{
          type: null,
        }}
        disabled
        iconLeft={<CalendarMonthIcon />}
        label={<FormattedDate day="numeric" month="long" value={lastRequestDate} year="numeric" />}
        size="small"
        theme={theme}
        variant={variant}
      />
    </span>
  );

  return (
    <FormattedMessage defaultMessage="Last Requested" description="This appears as a label before a date with a colon between them, like 'Last Requested: May 5, 2023'." id="sharedItemCard.lastRequested">
      { lastRequestDateLabel => (
        tooltip ? (
          <Tooltip
            arrow
            placement="top"
            title={(
              <>
                <span>{tooltipLabel || lastRequestDateLabel}:</span>
                <ul>
                  <li>{Intl.DateTimeFormat(intl.locale, { year: 'numeric', month: 'long', day: 'numeric' }).format(lastRequestDate)}</li>
                  <li>{Intl.DateTimeFormat(intl.locale, { hour: 'numeric', minute: 'numeric' }).format(lastRequestDate)}</li>
                </ul>
              </>
            )}
          >
            {buttonContent}
          </Tooltip>
        )
          : buttonContent
      )}
    </FormattedMessage>
  );
};

LastRequestDate.propTypes = {
  intl: intlShape.isRequired,
  lastRequestDate: PropTypes.instanceOf(Date).isRequired,
  variant: PropTypes.string,
  theme: PropTypes.string,
  tooltip: PropTypes.bool,
  tooltipLabel: PropTypes.node,
};

LastRequestDate.defaultProps = {
  variant: 'contained',
  theme: 'lightBeige',
  tooltip: true,
  tooltipLabel: '',
};

export default injectIntl(LastRequestDate);
