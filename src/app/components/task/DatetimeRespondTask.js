import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
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

    let date = '';
    let hour = '';
    let minute = '';
    const note = this.props.note || '';
    let timezone = 'GMT';

    let response = this.props.response;

    if (response) {
      response = convertNumbers2English(response);
      const values = response.match(/^(\d+-\d+-\d+) (\d+):(\d+) ([+-]?\d+) ([^ ]+)/);
      const hasTime = !/notime/.test(response);
      date = new Date(`${values[1]} 00:00`);
      if (hasTime) {
        hour = values[2];
        minute = values[3];
      }
      timezone = values[5];
    }

    this.state = {
      taskAnswerDisabled: true,
      timeError: null,
      timezone,
      date,
      hour,
      minute,
      note,
      original: {
        timezone,
        date,
        hour,
        minute,
        note,
      },
    };
  }

  canSubmit(date) {
    const value = date || this.state.date;
    return !!value;
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
    this.setState({ focus: true, timezone: value });
  }

  handleChangeNote(e) {
    this.setState({ note: e.target.value, taskAnswerDisabled: !this.canSubmit() });
  }

  handleChangeTime(part, e) {
    const value = parseInt(convertNumbers2English(e.target.value));

    const validators = {
      hour: [0, 23],
      minute: [0, 59],
    };

    const state = {
      focus: true,
      taskAnswerDisabled: !this.canSubmit(),
    };
    state[part] = e.target.value;

    if (
      e.target.value !== '' &&
      (isNaN(value) || value < validators[part][0] || value > validators[part][1])
    ) {
      state.timeError = this.props.intl.formatMessage(messages.timeError);
    } else {
      state.timeError = null;
    }

    this.setState(state);
  }

  handleSubmit() {
    if (!this.state.taskAnswerDisabled && !this.state.timeError) {
      const date = this.state.date;
      const note = this.state.note;
      let month = `${date.getMonth() + 1}`;
      let day = `${date.getDate()}`;
      const year = date.getFullYear();
      if (month.length < 2) {
        month = `0${month}`;
      }
      if (day.length < 2) {
        day = `0${day}`;
      }
      let hour = 0;
      let minute = 0;
      if (this.state.hour !== '') {
        hour = this.state.hour;
      }
      if (this.state.minute !== '') {
        minute = this.state.minute;
      }
      let offset = '';
      const timezone = this.state.timezone;
      if (timezones[timezone]) {
        offset = timezones[timezone].offset;
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
      this.props.onSubmit(response, note);
    }
  }

  getLocale() {
    return new CheckContext(this).getContextStore().locale || 'en';
  }

  handleCancel() {
    const ori = this.state.original;
    this.setState({
      focus: false,
      taskAnswerDisabled: true,
      timezone: ori.timezone,
      date: ori.date,
      hour: ori.hour,
      minute: ori.minute,
      note: ori.note,
    });
    if (this.props.onDismiss) {
      this.props.onDismiss();
    }
  }

  render() {
    const actionBtns = (
      <p className="task__resolver">
        <FlatButton
          className="task__cancel"
          label={<FormattedMessage id="datetimeRespondTask.cancelTask" defaultMessage="Cancel" />}
          onClick={this.handleCancel.bind(this)}
        />
        <FlatButton
          className="task__save"
          label={
            <FormattedMessage
              id="datetimeRespondTask.resolveTask"
              defaultMessage="Resolve task"
            />
          }
          primary
          onClick={this.handlePressButton.bind(this)}
          disabled={this.state.taskAnswerDisabled}
        />
      </p>
    );

    const locale = this.getLocale();
    let DateTimeFormat;

    if (areIntlLocalesSupported(['en', 'pt', 'ar', 'fr'])) {
      DateTimeFormat = global.Intl.DateTimeFormat;
    } else {
      DateTimeFormat = IntlPolyfill.DateTimeFormat;
      require('intl/locale-data/jsonp/pt');
      require('intl/locale-data/jsonp/en');
      require('intl/locale-data/jsonp/ar');
      require('intl/locale-data/jsonp/fr');
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
                hintText="HH"
                name="hour"
                style={styles.time}
                inputStyle={styles.time}
                hintStyle={styles.time}
                value={this.state.hour}
                onChange={this.handleChangeTime.bind(this, 'hour')}
                onFocus={() => {this.setState({ focus: true })}}
              />{' '}
              <div>:</div>{' '}
              <TextField
                name="minute"
                hintText="MM"
                style={styles.time}
                inputStyle={styles.time}
                hintStyle={styles.time}
                value={this.state.minute}
                onChange={this.handleChangeTime.bind(this, 'minute')}
                onFocus={() => {this.setState({ focus: true })}}
              />
              <SelectField
                value={this.state.timezone}
                onChange={this.handleChangeTimezone.bind(this)}
                autoWidth
                className="task__datetime-timezone"
                style={{ marginLeft: units(2) }}
              >
                {Object.values(timezones).map(tz =>
                  <MenuItem
                    key={tz.code}
                    value={tz.code}
                    primaryText={<span dir="ltr">{tz.label}</span>}
                  />,
                )}
              </SelectField>
            </FlexRow>
          </div>
        </FlexRow>
        <div style={styles.error}>
          {this.state.timeError ? this.state.timeError : ''}
        </div>
        <TextField
          floatingLabelText={
            <FormattedMessage
              id="datetimeRespondTask.note"
              defaultMessage="Note any additional details here."
            />
          }
          name="note"
          value={this.state.note}
          multiLine
          fullWidth
          onChange={this.handleChangeNote.bind(this)}
          onFocus={() => {this.setState({ focus: true })}}
        />
        { this.state.focus || this.props.response ? actionBtns : null }
      </div>
    );
  }
}

DatetimeRespondTask.propTypes = {
  intl: intlShape.isRequired,
};

DatetimeRespondTask.contextTypes = {
  store: React.PropTypes.object,
};

export default injectIntl(DatetimeRespondTask);
