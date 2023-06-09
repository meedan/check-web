import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedDate, injectIntl, intlShape } from 'react-intl';
import Button from '@material-ui/core/Button';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import { ToggleButton, ToggleButtonGroup } from '../../cds/inputs/ToggleButtonGroup';
import { getTimeZoneOptions } from '../../../helpers';
import Alert from '../../cds/alerts-and-prompts/Alert';
import Tooltip from '../../cds/alerts-and-prompts/Tooltip';
import Select from '../../cds/inputs/Select';
import DatePicker from '../../cds/inputs/DatePicker';
import Time from '../../cds/inputs/Time';
import styles from './NewsletterComponent.module.css';
import ErrorOutlineIcon from '../../../icons/error_outline.svg';

const timezones = getTimeZoneOptions();

const NewsletterScheduler = ({
  type,
  timezone,
  onUpdate,
  sendEvery,
  sendOn,
  time,
  parentErrors,
  subscribersCount,
  lastDeliveryError,
  lastSentAt,
  lastScheduledAt,
  lastScheduledBy,
  scheduled,
  disabled,
  intl,
}) => {
  const { format } = new Intl.DateTimeFormat(intl.locale, { weekday: 'short' });
  const weekDaysLabels = [...Array(7).keys()].map(day => format(new Date(Date.UTC(2021, 5, day))));
  const weekDaysValues = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  return (
    <div className={`${styles['newsletter-scheduler']} ${scheduled ? styles['newsletter-scheduled'] : styles['newsletter-paused']}`}>
      <div className={`typography-subtitle2 ${styles['newsletter-scheduler-title']}`}>
        <FormattedMessage id="newsletterScheduler.title" defaultMessage="Schedule" description="Title for newsletter schedule component" />
        {' '}
        { (scheduled && lastScheduledBy && lastScheduledAt) ?
          <Tooltip
            placement="right"
            title={
              <FormattedMessage
                id="newsletterScheduler.tooltipScheduled"
                defaultMessage="Scheduled by {name} on {date}"
                values={{
                  name: lastScheduledBy,
                  date: <FormattedDate value={lastScheduledAt * 1000} year="numeric" month="long" day="numeric" />,
                }}
                description="Tooltip message displayed on newsletter scheduler."
              />
            }
            arrow
          >
            <InfoOutlinedIcon className={styles['tooltip-icon']} />
          </Tooltip> :
          null
        }
        { (!scheduled && lastSentAt) ?
          <Tooltip
            placement="right"
            title={
              <FormattedMessage
                id="newsletterScheduler.tooltipSent"
                defaultMessage="Last sent on {date}"
                values={{
                  name: lastSentAt,
                  date: <FormattedDate value={lastSentAt * 1000} year="numeric" month="long" day="numeric" />,
                }}
                description="Tooltip message displayed on newsletter scheduler."
              />
            }
            arrow
          >
            <InfoOutlinedIcon className={styles['tooltip-icon']} />
          </Tooltip> :
          null
        }
      </div>

      { lastDeliveryError === 'CONTENT_HASNT_CHANGED' ?
        <Alert
          hasBorder
          type="error"
          title={
            <FormattedMessage
              id="newsletterScheduler.errorContentHasntChanged"
              defaultMessage="The newsletter was unpublished because its content has not been updated since it was last sent."
              description="Text displayed in an error box on newsletter settings page when RSS content has not changed"
            />
          }
        /> : null
      }

      { lastDeliveryError === 'RSS_ERROR' ?
        <Alert
          hasBorder
          type="error"
          title={
            <FormattedMessage
              id="newsletterScheduler.errorRss"
              defaultMessage="The newsletter was unpublished because no content could be retrieved from the RSS feed."
              description="Text displayed in an error box on newsletter settings page when RSS feed could not be loaded"
            />
          }
        /> : null
      }

      <div className={styles['newsletter-scheduler-schedule']}>
        { type === 'rss' ?
          <ToggleButtonGroup
            label={
              <FormattedMessage
                id="newsletterScheduler.sendEvery"
                defaultMessage="Send every"
                description="Label on an input where the user selects in which days of the week to send an RSS newsletter"
              />
            }
            variant="contained"
            value={sendEvery}
            onChange={(e, newValue) => { onUpdate('sendEvery', newValue); }}
          >
            {weekDaysValues.map((value, index) => (
              <ToggleButton value={value} key={value} disabled={scheduled}>
                {weekDaysLabels[index]}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          : null
        }

        { type === 'static' ?
          <DatePicker
            label={<FormattedMessage id="newsletterScheduler.sendOn" defaultMessage="Send on" description="Label on a input where the user selects a date to send a newsletter" />}
            value={sendOn}
            onChange={(e) => { onUpdate('sendOn', e.target.value); }}
            disabled={scheduled}
            error={parentErrors.send_on}
            helpContent={parentErrors.send_on && parentErrors.send_on}
            required
          />
          : null
        }

        <div className={styles['newsletter-scheduler-time']}>
          <span className="typography-caption">
            <FormattedMessage id="newsletterScheduler.at" defaultMessage="at" description="This preposition is in the middle of a sentence like 'send this newsletter *at* 10h00'" />
          </span>
          <Time
            value={time}
            onChange={(e) => { onUpdate('time', e.target.value); }}
            disabled={scheduled}
            error={parentErrors.time}
            helpContent={parentErrors.time && parentErrors.time}
            required
          />
          <Select
            className={styles.select}
            // We check for both code ('Europe/London') and value ('Europe/London (GMT+1:00)') because default values in the browser will only guarantee the first, but if it's saved, the timezone is returned from the API with the offset appended. Doing it this way means we don't have to recalculate the offset in the parent NewsletterComponent)
            value={timezones.find(item => item.code === timezone || item.value === timezone)?.value}
            onChange={(e) => { onUpdate('timezone', e.target.value); }}
            error={parentErrors.timezone}
            helpContent={parentErrors.timezone && parentErrors.timezone}
            disabled={scheduled}
          >
            <option value="" />
            { timezones.map(tz => <option key={tz.code} value={tz.value}>{tz.label}</option>) }
          </Select>
        </div>
        { parentErrors.datetime_past && (
          <div className={`typography-caption ${styles['help-container']} ${styles['error-label']}`}>
            <ErrorOutlineIcon className={styles['error-icon']} />
            &nbsp;{parentErrors.datetime_past}
          </div>
        )}

        { subscribersCount !== null ?
          <div className={styles['newsletter-scheduler-subscribers']}>
            <div className="typography-overline">
              <FormattedMessage id="newsletterScheduler.subscribers" defaultMessage="Subscribers" description="Label related to the number of subscribers of a newsletter" />
            </div>
            <div className="typography-subtitle2">
              {subscribersCount}
            </div>
          </div> : null }
      </div>

      <div className={styles['newsletter-schedule']}>
        { scheduled ?
          <Button
            variant="contained"
            color="primary"
            className={styles['newsletter-pause-button']}
            onClick={() => { onUpdate('scheduled', false); }}
            startIcon={<PauseIcon />}
            disabled={disabled}
            disableElevation
          >
            <FormattedMessage id="newsletterScheduler.pause" defaultMessage="Pause" description="Label for a button to pause a newsletter" />
          </Button> :
          <Button
            variant="contained"
            color="primary"
            className={styles['newsletter-schedule-button']}
            onClick={() => { onUpdate('scheduled', true); }}
            startIcon={<PlayArrowIcon />}
            disabled={disabled}
            disableElevation
          >
            <FormattedMessage id="newsletterScheduler.schedule" defaultMessage="Schedule" description="Label for a button to schedule a newsletter" />
          </Button>
        }
      </div>
    </div>
  );
};

NewsletterScheduler.defaultProps = {
  sendEvery: ['wednesday'],
  sendOn: '',
  time: '09:00',
  subscribersCount: null,
  parentErrors: {},
  lastDeliveryError: null,
  lastSentAt: null,
  lastScheduledAt: null,
  lastScheduledBy: null,
  scheduled: false,
  disabled: false,
};

NewsletterScheduler.propTypes = {
  type: PropTypes.oneOf(['rss', 'static']).isRequired,
  timezone: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
  sendEvery: PropTypes.string,
  sendOn: PropTypes.number, // Timestamp
  time: PropTypes.string,
  subscribersCount: PropTypes.number,
  parentErrors: PropTypes.object,
  lastDeliveryError: PropTypes.oneOf(['CONTENT_HASNT_CHANGED', 'RSS_ERROR']),
  lastSentAt: PropTypes.number, // Timestamp
  lastScheduledAt: PropTypes.number, // Timestamp
  lastScheduledBy: PropTypes.string, // User name
  scheduled: PropTypes.bool,
  disabled: PropTypes.bool,
  intl: intlShape.isRequired,
};

export default injectIntl(NewsletterScheduler);
