import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedDate, injectIntl, intlShape } from 'react-intl';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import { getTimeZones } from '@vvo/tzdb';
import { ToggleButton, ToggleButtonGroup } from '../../cds/inputs/ToggleButtonGroup';
import Select from '../../cds/inputs/Select';
import DatePicker from '../../cds/inputs/DatePicker';
import Time from '../../cds/inputs/Time';
import styles from './NewsletterComponent.module.css';

const timezones = getTimeZones({ includeUtc: true }).map((option) => {
  const offset = option.currentTimeOffsetInMinutes / 60;
  const fullOffset = option.currentTimeFormat.split(' ')[0];
  const sign = offset < 0 ? '' : '+';
  const newOption = {
    code: option.name,
    label: `${option.name} (GMT${sign}${offset})`,
    value: `${option.name} (GMT${fullOffset})`,
  };
  return newOption;
});

const NewsletterScheduler = ({
  type,
  timezone,
  onUpdate,
  sendEvery,
  sendOn,
  time,
  subscribersCount,
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
            classes={{
              tooltip: styles.tooltip,
            }}
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
            classes={{
              tooltip: styles.tooltip,
            }}
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

      <div className={styles['newsletter-scheduler-schedule']}>
        { type === 'rss' ?
          <ToggleButtonGroup
            label={
              <FormattedMessage
                id="newsletterScheduler.sendEvery"
                defaultMessage="Send every:"
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
            label={<FormattedMessage id="newsletterScheduler.sendOn" defaultMessage="Send on:" description="Label on a input where the user selects a date to send a newsletter" />}
            value={sendOn}
            onChange={(e) => { onUpdate('sendOn', e.target.value); }}
            disabled={scheduled}
            error={!sendOn}
            required
          />
          : null
        }

        <div className={styles['newsletter-scheduler-time']}>
          <span className="typography-caption">
            <FormattedMessage id="newsletterScheduler.at" defaultMessage="at" description="This preposition is in the middle of a sentence like 'send this newsletter *at* 10h00'" />
          </span>
          <Time value={time} onChange={(e) => { onUpdate('time', e.target.value); }} disabled={scheduled} required />
          <Select className={styles.select} value={timezone} onChange={(e) => { onUpdate('timezone', e.target.value); }} disabled={scheduled}>
            <option value="" />
            { timezones.map(tz => <option key={tz.code} value={tz.value}>{tz.label}</option>) }
          </Select>
        </div>

        <div className={styles['newsletter-scheduler-subscribers']}>
          <div className="typography-overline">
            <FormattedMessage id="newsletterScheduler.subscribers" defaultMessage="Subscribers" description="Label related to the number of subscribers of a newsletter" />
          </div>
          <div className="typography-subtitle2">
            {subscribersCount}
          </div>
        </div>
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
  subscribersCount: 0,
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
  lastSentAt: PropTypes.number, // Timestamp
  lastScheduledAt: PropTypes.number, // Timestamp
  lastScheduledBy: PropTypes.string, // User name
  scheduled: PropTypes.bool,
  disabled: PropTypes.bool,
  intl: intlShape.isRequired,
};

export default injectIntl(NewsletterScheduler);
