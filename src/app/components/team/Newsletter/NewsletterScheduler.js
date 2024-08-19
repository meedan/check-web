/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedDate, injectIntl, intlShape } from 'react-intl';
import cx from 'classnames/bind';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import { ToggleButton, ToggleButtonGroup } from '../../cds/inputs/ToggleButtonGroup';
import { getTimeZoneOptions } from '../../../helpers';
import Alert from '../../cds/alerts-and-prompts/Alert';
import Tooltip from '../../cds/alerts-and-prompts/Tooltip';
import Select from '../../cds/inputs/Select';
import DatePicker from '../../cds/inputs/DatePicker';
import Time from '../../cds/inputs/Time';
import ErrorOutlineIcon from '../../../icons/error_outline.svg';
import InfoOutlinedIcon from '../../../icons/info.svg';
import PlayArrowIcon from '../../../icons/play_arrow.svg';
import PauseIcon from '../../../icons/pause.svg';
import styles from './NewsletterComponent.module.css';
import settingsStyles from '../Settings.module.css';

const timezones = getTimeZoneOptions();

const getWeekDays = (locale) => {
  const weekDays = {};
  const { format } = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' });
  weekDays.labels = [...Array(7).keys()].map(day => format(new Date(`2021-08-0${day + 1}T00:00:00Z`)));
  weekDays.values = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return weekDays;
};

// eslint-disable-next-line import/no-unused-modules
export { getWeekDays }; // For unit test

const NewsletterScheduler = ({
  disabled,
  intl,
  lastDeliveryError,
  lastScheduledAt,
  lastScheduledBy,
  lastSentAt,
  onUpdate,
  parentErrors,
  scheduled,
  sendEvery,
  sendOn,
  subscribersCount,
  time,
  timezone,
  type,
}) => {
  const weekDays = getWeekDays(intl.locale);
  const weekDaysLabels = weekDays.labels;
  const weekDaysValues = weekDays.values;

  return (
    <div className={`${styles['newsletter-scheduler']} ${scheduled ? styles['newsletter-scheduled'] : styles['newsletter-paused']}`}>
      <div className={cx(settingsStyles['setting-content-container-title'], styles['newsletter-scheduler-title'])}>
        { type === 'static' ?
          <FormattedMessage defaultMessage="Send on" description="Label on a input where the user selects a date to send a newsletter" id="newsletterScheduler.sendOn" />
          : null
        }
        { type === 'rss' ?
          <FormattedMessage defaultMessage="Send every" description="Label on an input where the user selects in which days of the week to send an RSS newsletter" id="newsletterScheduler.sendEvery" />
          : null
        }
        {' '}
        { (scheduled && lastScheduledBy && lastScheduledAt) ?
          <Tooltip
            arrow
            placement="right"
            title={
              <FormattedMessage
                defaultMessage="Scheduled by {name} on {date}"
                description="Tooltip message displayed on newsletter scheduler."
                id="newsletterScheduler.tooltipScheduled"
                values={{
                  name: lastScheduledBy,
                  date: <FormattedDate day="numeric" month="long" value={lastScheduledAt * 1000} year="numeric" />,
                }}
              />
            }
          >
            <span className={settingsStyles['tooltip-icon']}>
              <InfoOutlinedIcon />
            </span>
          </Tooltip> :
          null
        }
        { (!scheduled && lastSentAt) ?
          <Tooltip
            arrow
            placement="right"
            title={
              <FormattedMessage
                defaultMessage="Last sent on {date}"
                description="Tooltip message displayed on newsletter scheduler."
                id="newsletterScheduler.tooltipSent"
                values={{
                  name: lastSentAt,
                  date: <FormattedDate day="numeric" month="long" value={lastSentAt * 1000} year="numeric" />,
                }}
              />
            }
          >
            <span className={settingsStyles['tooltip-icon']}>
              <InfoOutlinedIcon />
            </span>
          </Tooltip> :
          null
        }
      </div>

      { lastDeliveryError === 'CONTENT_HASNT_CHANGED' ?
        <Alert
          contained
          title={
            <FormattedMessage
              defaultMessage="The newsletter was not sent because its content has not been updated since the last successful delivery."
              description="Text displayed in an error box on newsletter settings page when RSS content has not changed"
              id="newsletterScheduler.errorContentHasntChanged"
            />
          }
          variant="error"
        /> : null
      }

      { lastDeliveryError === 'RSS_ERROR' ?
        <Alert
          contained
          title={
            <FormattedMessage
              defaultMessage="The newsletter was not sent because no content could be retrieved from the RSS feed."
              description="Text displayed in an error box on newsletter settings page when RSS feed could not be loaded"
              id="newsletterScheduler.errorRss"
            />
          }
          variant="error"
        /> : null
      }

      <div className={styles['newsletter-scheduler-schedule']}>
        { type === 'rss' ?
          <ToggleButtonGroup
            value={sendEvery}
            variant="contained"
            onChange={(e, newValue) => { onUpdate('sendEvery', newValue); }}
          >
            {weekDaysValues.map((value, index) => (
              <ToggleButton disabled={scheduled} key={value} value={value}>
                {weekDaysLabels[index]}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          : null
        }

        { type === 'static' ?
          <DatePicker
            disabled={scheduled}
            error={parentErrors.send_on}
            helpContent={parentErrors.send_on && parentErrors.send_on}
            required
            value={sendOn}
            onChange={(e) => { onUpdate('sendOn', e.target.value); }}
          />
          : null
        }

        <div className={styles['newsletter-scheduler-time']}>
          <span className="typography-caption">
            <FormattedMessage defaultMessage="at" description="This preposition is in the middle of a sentence like 'send this newsletter *at* 10h00'" id="newsletterScheduler.at" />
          </span>
          <Time
            disabled={scheduled}
            error={parentErrors.time}
            helpContent={parentErrors.time && parentErrors.time}
            required
            value={time}
            onChange={(e) => { onUpdate('time', e.target.value); }}
          />
          <Select
            className={styles.select}
            // We check for both code ('Europe/London') and value ('Europe/London (GMT+1:00)') because default values in the browser will only guarantee the first, but if it's saved, the timezone is returned from the API with the offset appended. Doing it this way means we don't have to recalculate the offset in the parent NewsletterComponent)
            disabled={scheduled}
            error={parentErrors.timezone}
            helpContent={parentErrors.timezone && parentErrors.timezone}
            value={timezones.find(item => item.code === timezone || item.value === timezone)?.value}
            onChange={(e) => { onUpdate('timezone', e.target.value); }}
          >
            <option value="" />
            { timezones.map(tz => <option key={tz.code} value={tz.value}>{tz.label}</option>) }
          </Select>
        </div>
      </div>
      { parentErrors.datetime_past && (
        <div className={`typography-caption ${styles['help-container']} ${styles['error-label']}`}>
          <ErrorOutlineIcon className={styles['error-icon']} />
          &nbsp;{parentErrors.datetime_past}
        </div>
      )}

      <div className={styles['newsletter-schedule-actions']}>
        { scheduled ?
          <ButtonMain
            disabled={disabled}
            iconLeft={<PauseIcon />}
            label={
              <FormattedMessage defaultMessage="Pause" description="Label for a button to pause a newsletter" id="newsletterScheduler.pause" />
            }
            size="default"
            theme="alert"
            variant="contained"
            onClick={() => { onUpdate('scheduled', false); }}
          /> :
          <ButtonMain
            disabled={disabled}
            iconLeft={<PlayArrowIcon />}
            label={
              <FormattedMessage defaultMessage="Schedule" description="Label for a button to schedule a newsletter" id="newsletterScheduler.schedule" />
            }
            size="default"
            theme="validation"
            variant="contained"
            onClick={() => { onUpdate('scheduled', true); }}
          />
        }
        { subscribersCount !== null &&
          <div className={styles['newsletter-schedule-meta']}>
            <small className={styles['newsletter-scheduler-subscribers']}>
              <FormattedMessage defaultMessage="Subscribers:" description="Label related to the number of subscribers of a newsletter" id="newsletterScheduler.subscribers" />
              &nbsp;
              <strong>
                {subscribersCount}
              </strong>
            </small>
          </div>
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
