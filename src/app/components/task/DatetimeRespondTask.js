import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TextField from 'material-ui/TextField';
import Button from '@material-ui/core/Button';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import DatePicker from 'material-ui/DatePicker';
import areIntlLocalesSupported from 'intl-locales-supported';
import IntlPolyfill from 'intl';
import IconDateRange from 'material-ui/svg-icons/action/date-range';
import IconSchedule from 'material-ui/svg-icons/action/schedule';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import CheckContext from '../../CheckContext';
import { convertNumbers2English } from '../../helpers';
import { alertRed, black38, black54, units, caption, FlexRow } from '../../styles/js/shared';
import timezones from '../../timezones';

const styles = {
  error: {
    font: 'caption',
    color: alertRed,
    display: 'block',
  },
  primaryColumn: {
    flex: 10,
  },
  secondaryColumn: {
    color: black54,
    height: units(2.5),
    width: units(2.5),
    flex: '1',
  },
  row: {
    marginBottom: units(2),
  },
  time: {
    width: units(6),
    textAlign: 'center',
  },
  label: {
    font: caption,
    color: black38,
  },
};

const messages = defineMessages({
  ok: {
    id: 'datetimeRespondTask.ok',
    defaultMessage: 'OK',
  },
  cancel: {
    id: 'datetimeRespondTask.cancel',
    defaultMessage: 'Cancel',
  },
  timeError: {
    id: 'datetimeRespondTask.timeError',
    defaultMessage: 'Error: invalid time',
  },
});

class DatetimeRespondTask extends Component {
  constructor(props) {
    super(props);

    let date = null;
    let hour = '';
    let minute = '';
    let timezone = 'GMT';
    const response = this.props.response ? convertNumbers2English(this.props.response) : null;
    if (response) {
      const values = response.match(/^(\d+-\d+-\d+) (\d+):(\d+) ([+-]?\d+) ([^ ]+)/);
      const hasTime = !/notime/.test(response);
      date = new Date(`${values[1]} 00:00`);
      if (hasTime) {
        ([, , hour, minute] = values);
      }
      ([, , , , , timezone] = values);
    }

    this.state = {
      taskAnswerDisabled: true,
      timeError: null,
      timezone,
      date,
      hour,
      minute,
      original: {
        timezone,
        date,
        hour,
        minute,
      },
    };
  }

  getLocale() {
    return new CheckContext(this).getContextStore().locale || 'en';
  }

  canSubmit(date) {
    const value = date || this.state.date;

    if (!value || Number.isNaN(new Date(value).getTime())) {
      return false;
    }

    return true;
  }

  handlePressButton() {
    if (this.canSubmit()) {
      this.handleSubmit();
    }
  }

  handleChange(e, date) {
    this.setState({ focus: true, taskAnswerDisabled: !this.canSubmit(date), date });
  }

  handleChangeTimezone(e, index, value) {
    this.setState({ focus: true, timezone: value, taskAnswerDisabled: !this.canSubmit() });
  }

  handleChangeTime(part, e) {
    const value = convertNumbers2English(e.target.value);

    const validators = {
      hour: /^$|^([0-9]|0[0-9]|1[0-9]|2[0-3])$/,
      minute: /^$|^([0-5]?[0-9])$/,
    };

    const state = {
      focus: true,
      taskAnswerDisabled: !this.canSubmit(),
    };

    if (!validators[part].test(value)) {
      this.setState(state);
      return;
    }

    state[part] = e.target.value;

    this.setState(state);
  }

  handleSubmit() {
    if (!this.state.taskAnswerDisabled && !this.state.timeError) {
      const { date, timezone } = this.state;

      const format = (val, size, char) => `${val}`.padStart(size, char);

      const month = format(date.getMonth() + 1, 2, '0');
      const day = format(date.getDate(), 2, '0');
      const year = date.getFullYear();

      const hour = (this.state.hour && this.state.hour !== '')
        ? format(this.state.hour, 2, '0')
        : '0';

      const minute = (this.state.minute && this.state.minute !== '')
        ? format(this.state.minute, 2, '0')
        : '0';

      let offset = '';
      if (timezones[timezone]) {
        ({ offset } = timezones[timezone]);
        if (offset > 0) {
          offset = `+${offset}`;
        }
      }

      let notime = '';
      if (this.state.hour === '' && this.state.minute === '') {
        notime = 'notime';
      }

      const response = `${year}-${month}-${day} ${hour}:${minute} ${offset} ${timezone} ${notime}`;

      this.setState({ taskAnswerDisabled: true });
      this.props.onSubmit(response);
    }
  }

  handleCancel() {
    const { original } = this.state;
    this.setState({
      focus: false,
      taskAnswerDisabled: true,
      timezone: original.timezone,
      date: original.date,
      hour: original.hour,
      minute: original.minute,
    });
    if (this.props.onDismiss) {
      this.props.onDismiss();
    }
  }

  render() {
    const actionBtns = (
      <p className="task__resolver">
        <Button className="task__cancel" onClick={this.handleCancel.bind(this)}>
          <FormattedMessage id="datetimeRespondTask.cancelTask" defaultMessage="Cancel" />
        </Button>
        <Button
          className="task__save"
          color="primary"
          onClick={this.handlePressButton.bind(this)}
          disabled={this.state.taskAnswerDisabled}
        >
          <FormattedMessage
            id="datetimeRespondTask.answerTask"
            defaultMessage="Answer task"
          />
        </Button>
      </p>
    );

    const locale = this.getLocale();
    let DateTimeFormat;

    if (areIntlLocalesSupported(['en', 'pt', 'ar', 'fr'])) {
      ({ DateTimeFormat } = global.Intl.DateTimeFormat);
    } else {
      ({ DateTimeFormat } = IntlPolyfill.DateTimeFormat);
      require('intl/locale-data/jsonp/pt'); // eslint-disable-line global-require
      require('intl/locale-data/jsonp/en'); // eslint-disable-line global-require
      require('intl/locale-data/jsonp/ar'); // eslint-disable-line global-require
      require('intl/locale-data/jsonp/fr'); // eslint-disable-line global-require
      require('intl/locale-data/jsonp/es'); // eslint-disable-line global-require
    }

    return (
      <div>
        <FlexRow style={styles.row}>
          <IconDateRange className="task__icon" style={styles.secondaryColumn} />
          <DatePicker
            floatingLabelText={
              <FormattedMessage
                id="datetimeRespondTask.pickDate"
                defaultMessage="Pick a date from the calendar"
              />
            }
            id="task__response-date"
            className="task__response-input"
            name="response"
            value={this.state.date}
            onChange={this.handleChange.bind(this)}
            fullWidth
            locale={locale}
            DateTimeFormat={DateTimeFormat}
            okLabel={this.props.intl.formatMessage(messages.ok)}
            cancelLabel={this.props.intl.formatMessage(messages.cancel)}
            mode="landscape"
            style={styles.primaryColumn}
          />
        </FlexRow>

        <FlexRow style={styles.row}>
          <IconSchedule className="task__icon" style={styles.secondaryColumn} />
          <div style={styles.primaryColumn}>
            <label htmlFor="task__response-time" style={styles.label} className="task__label">
              <FormattedMessage
                id="datetimeRespondTask.timeOptional"
                defaultMessage="Time (optional)"
              />
            </label>
            <FlexRow
              style={{ justifyContent: 'flex-start', alignItems: 'center' }}
              id="task__response-time"
            >
              <TextField
                name="hour"
                hintText="HH"
                maxLength="2"
                style={styles.time}
                inputStyle={styles.time}
                hintStyle={styles.time}
                value={this.state.hour}
                onChange={this.handleChangeTime.bind(this, 'hour')}
                onFocus={() => { this.setState({ focus: true }); }}
              />{' '}
              <div>:</div>{' '}
              <TextField
                name="minute"
                hintText="MM"
                maxLength="2"
                style={styles.time}
                inputStyle={styles.time}
                hintStyle={styles.time}
                value={this.state.minute}
                onChange={this.handleChangeTime.bind(this, 'minute')}
                onFocus={() => { this.setState({ focus: true }); }}
              />
              <SelectField
                value={this.state.timezone}
                onChange={this.handleChangeTimezone.bind(this)}
                autoWidth
                className="task__datetime-timezone"
                style={{ marginLeft: units(2) }}
              >
                {Object.keys(timezones).map(tz => (
                  <MenuItem
                    key={tz}
                    value={timezones[tz].code}
                    primaryText={<span dir="ltr">{timezones[tz].label}</span>}
                  />))}
              </SelectField>
            </FlexRow>
          </div>
        </FlexRow>
        <div style={styles.error}>
          {this.state.timeError ? this.state.timeError : ''}
        </div>
        { this.state.focus || this.props.response ? actionBtns : null }
      </div>
    );
  }
}

DatetimeRespondTask.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  intl: intlShape.isRequired,
};

DatetimeRespondTask.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(DatetimeRespondTask);
