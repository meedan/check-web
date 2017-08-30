import React, { Component, PropTypes } from 'react';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import DatePicker from 'material-ui/DatePicker';
import CheckContext from '../../CheckContext';
import areIntlLocalesSupported from 'intl-locales-supported';
import persianUtils from 'material-ui-persian-date-picker-utils';
import IntlPolyfill from 'intl';
import MdDateRange from 'react-icons/lib/md/date-range';
import timezones from '../../timezones';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import { convertNumbers2English } from '../../helpers';

const messages = defineMessages({
  ok: {
    id: 'datetimeRespondTask.ok',
    defaultMessage: 'OK'
  },
  cancel: {
    id: 'datetimeRespondTask.cancel',
    defaultMessage: 'Cancel'
  },
  timeError: {
    id: 'datetimeRespondTask.timeError',
    defaultMessage: 'Error: invalid time'
  }
});

class DatetimeRespondTask extends Component {
  constructor(props) {
    super(props);

    let date = '';
    let hour = '';
    let minute = '';
    let note = this.props.note || '';
    let timezone = new Date().toString().match(/\(([A-Za-z\s].*)\)/)[1];

    const response = this.props.response;

    if (response) {
      const values = response.match(/^(\d+-\d+-\d+) (\d+):(\d+) ([+-]?\d+) (.*)$/);
      date = new Date(`${values[1]} 00:00`);
      if (parseInt(values[2]) > 0) {
        hour = values[2];
      }
      if (parseInt(values[3]) > 0) {
        minute = values[3];
      }
      timezone = values[5];
    }

    this.state = {
      taskAnswerDisabled: false,
      timeError: null,
      timezone,
      date,
      hour,
      minute,
      note,
    };
  }

  canSubmit(date) {
    const value = date || this.state.date;
    return !!value;
  }

  handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (this.canSubmit()) {
        this.handleSubmit();
      }
      e.preventDefault();
    }
  }

  handlePressButton() {
    if (this.canSubmit()) {
      this.handleSubmit();
    }
  }

  handleChange(e, date) {
    this.setState({ taskAnswerDisabled: !this.canSubmit(date), date: date });
  }

  handleChangeTimezone(e, index, value) {
    this.setState({ timezone: value });
  }

  handleChangeNote(e) {
    this.setState({ note: e.target.value });
  }

  handleChangeTime(part, e) {
    const value = parseInt(convertNumbers2English(e.target.value));

    const validators = {
      hour: [0, 23],
      minute: [0, 59]
    };

    const state = {
      taskAnswerDisabled: !this.canSubmit()
    };
    state[part] = e.target.value;

    if (e.target.value != '' && (isNaN(value) || value < validators[part][0] || value > validators[part][1])) {
      state.timeError = this.props.intl.formatMessage(messages.timeError);
    }
    else {
      state.timeError = null;
    }

    this.setState(state);
  }

  handleSubmit() {
    if (!this.state.taskAnswerDisabled && !this.state.timeError) {

      const date = this.state.date;
      const note = this.state.note;
      let month = '' + (date.getMonth() + 1);
      let day = '' + date.getDate();
      const year = date.getFullYear();
      if (month.length < 2) {
        month = '0' + month;
      }
      if (day.length < 2) {
        day = '0' + day;
      }
      let hour = 0;
      let minute = 0;
      if (this.state.hour != '') {
        hour = this.state.hour;
      }
      if (this.state.minute != '') {
        minute = this.state.minute;
      }
      let offset = '';
      let timezone = this.state.timezone;
      if (timezones[timezone]) {
        offset = timezones[timezone].offset;
        if (offset > 0) {
          offset = '+' + offset;
        }
      }

      const response = `${year}-${month}-${day} ${hour}:${minute} ${offset} ${timezone}`;
 
      this.setState({ taskAnswerDisabled: true });
      this.props.onSubmit(response, note);
    }
  }

  getLocale() {
    return new CheckContext(this).getContextStore().locale || 'en';
  }

  render() {
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

    const timeStyles = {
      width: '42px',
      textAlign: 'center'
    };

    return (
      <div>
        <div style={{position: 'relative', display: 'inline-block', width: '100%', marginBottom: '16px' }}>
          <span className="task__icon"><MdDateRange /></span>
          <DatePicker
            floatingLabelText={<FormattedMessage id="datetimeRespondTask.pickDate" defaultMessage="Pick a date from the calendar" />}
            id="task__response-date"
            className="task__response-input"
            name="response"
            value={this.state.date}
            onKeyPress={this.handleKeyPress.bind(this)}
            onChange={this.handleChange.bind(this)}
            fullWidth
            locale={locale}
            DateTimeFormat={DateTimeFormat}
            okLabel={this.props.intl.formatMessage(messages.ok)}
            cancelLabel={this.props.intl.formatMessage(messages.cancel)}
            mode="landscape"
          />
        </div>
        <label className="task__label">
          <FormattedMessage id="datetimeRespondTask.timeOptional" defaultMessage="Time (optional)" />
        </label>
        <div id="task__response-time">
          <TextField hintText="00" name="hour" style={timeStyles} inputStyle={timeStyles} hintStyle={timeStyles} value={this.state.hour} onChange={this.handleChangeTime.bind(this, 'hour')} /> : <TextField name="minute" hintText="00" style={timeStyles} inputStyle={timeStyles} hintStyle={timeStyles} value={this.state.minute} onChange={this.handleChangeTime.bind(this, 'minute')} />
          <SelectField value={this.state.timezone} onChange={this.handleChangeTimezone.bind(this)} autoWidth={true} className="task__datetime-timezone">
            {Object.values(timezones).map(tz => <MenuItem key={tz.code} value={tz.code} primaryText={<span dir="ltr">{tz.label}</span>} />)}
          </SelectField>
        </div>
        <small className="task__error">{this.state.timeError ? this.state.timeError : ''}</small>
        <TextField
          floatingLabelText={<FormattedMessage id="datetimeRespondTask.note" defaultMessage="Note any additional details here." />}
          name="note"
          value={this.state.note}
          multiLine
          fullWidth
          onKeyPress={this.handleKeyPress.bind(this)}
          onChange={this.handleChangeNote.bind(this)} />
        <p className="task__resolver">
          <FlatButton className="task__save" label={<FormattedMessage id="datetimeRespondTask.resolveTask" defaultMessage="Resolve task" />} primary onClick={this.handlePressButton.bind(this)} />
        </p>
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
