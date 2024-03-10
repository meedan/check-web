import React from 'react';
import PropTypes from 'prop-types';
import { FormattedDate, FormattedMessage, injectIntl, intlShape } from 'react-intl';
import BulletSeparator from '../../layout/BulletSeparator';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import Tooltip from '../../cds/alerts-and-prompts/Tooltip';
import MediaTypeDisplayIcon from '../../media/MediaTypeDisplayIcon';
import MediaIcon from '../../../icons/perm_media.svg';
import CalendarMonthIcon from '../../../icons/calendar_month.svg';
import RequestsIcon from '../../../icons/question_answer.svg';
import ItemChannels from '../../cds/media-cards/ItemChannels';
import { getCompactNumber, getSeparatedNumber } from '../../../helpers';
import styles from './ItemCard.module.css';

const SharedItemCardFooter = ({
  buttonProps,
  mediaCount,
  mediaType,
  requestsCount,
  lastRequestDate,
  channels,
  intl,
}) => (
  <BulletSeparator
    className={styles.bulletSeparator}
    compact
    details={[
      mediaCount && (
        <FormattedMessage
          id="sharedItemCardFooter.medias"
          defaultMessage="Media"
          description="This appears as a label next to a number, like '1,234 Medias'. It should indicate to the user that whatever number they are viewing represents the number of medias attached to an item."
        >
          { mediasLabel => (
            <Tooltip
              arrow
              title={`${getSeparatedNumber(intl.locale, mediaCount)} ${mediasLabel}`}
              placement="top"
            >
              <span>
                <ButtonMain
                  disabled
                  size="small"
                  theme="brand"
                  iconLeft={mediaCount === 1 && mediaType ? <MediaTypeDisplayIcon mediaType={mediaType} /> : <MediaIcon />}
                  variant="contained"
                  label={getCompactNumber(intl.locale, mediaCount)}
                  {...buttonProps}
                />
              </span>
            </Tooltip>
          )}
        </FormattedMessage>),
      requestsCount && (
        <FormattedMessage
          id="sharedItemCardFooter.requests"
          defaultMessage="{requestsCount, plural, one {Request} other {Requests}}"
          description="This appears as a label next to a number, like '1,234 Requests'. It should indicate to the user that whatever number they are viewing represents the number of requests an item has gotten."
          values={{ requestsCount }}
        >
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
                  {...buttonProps}
                />
              </span>
            </Tooltip>
          )}
        </FormattedMessage>),
      lastRequestDate && (
        <FormattedMessage id="sharedItemCardFooter.lastRequested" defaultMessage="Last Requested" description="This appears as a label before a date with a colon between them, like 'Last Requested: May 5, 2023'.">
          { lastRequestDateLabel => (
            <Tooltip
              arrow
              title={(
                <>
                  <span>{lastRequestDateLabel}:</span>
                  <ul>
                    <li>{Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(lastRequestDate)}</li>
                    <li>{Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric' }).format(lastRequestDate)}</li>
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
                  {...buttonProps}
                />
              </span>
            </Tooltip>
          )}
        </FormattedMessage>),
      channels && <ItemChannels channels={channels} sortMainFirst />,
    ]}
  />
);

SharedItemCardFooter.defaultProps = {
  buttonProps: {},
  mediaCount: null,
  mediaType: null,
  requestsCount: null,
  lastRequestDate: null,
  channels: null,
};

SharedItemCardFooter.propTypes = {
  buttonProps: PropTypes.object,
  mediaCount: PropTypes.number,
  mediaType: PropTypes.string,
  requestsCount: PropTypes.number,
  lastRequestDate: PropTypes.instanceOf(Date),
  channels: PropTypes.exact({
    main: PropTypes.number,
    others: PropTypes.arrayOf(PropTypes.number),
  }),
  intl: intlShape.isRequired,
};

export default injectIntl(SharedItemCardFooter);
