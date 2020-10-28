import React, { Component } from 'react';
import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import { FormattedMessage } from 'react-intl';
import { DatePicker, TimePicker } from '@material-ui/pickers';
import Autocomplete from '@material-ui/lab/Autocomplete';
import InputAdornment from '@material-ui/core/InputAdornment';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import EventIcon from '@material-ui/icons/Event';
import { FormattedGlobalMessage } from '../MappedMessage';
import { convertNumbers2English } from '../../helpers';
import { alertRed, FlexRow } from '../../styles/js/shared';
import timezones from '../../timezones';

class DatetimeRespondTask extends Component {
  constructor(props) {
    super(props);

    let date = null;
    let hour = '';
    let minute = '';
    let timezone = null;
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
    if (timezone) {
      const code = timezone;
      timezone = timezones[code];
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

  handleChange(moment) {
    const date = moment.toDate();
    this.setState({ focus: true, taskAnswerDisabled: !this.canSubmit(date), date });
  }

  handleChangeTimezone(timezone) {
    this.setState({ focus: true, timezone, taskAnswerDisabled: !this.canSubmit() });
  }

  handleChangeTime(value) {
    const time = [value.toDate().getHours().toString(), value.toDate().getMinutes().toString()];
    const hour = convertNumbers2English(time[0]);
    const minute = convertNumbers2English(time[1]);
    this.setState({
      hour,
      minute,
      focus: true,
      taskAnswerDisabled: !this.canSubmit(),
    });
  }

  handleSubmit() {
    if (!this.state.taskAnswerDisabled && !this.state.timeError) {
      const { date } = this.state;
      const timezone = this.state.timezone || { code: 'GMT' };

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
      if (timezone && timezones[timezone.code]) {
        ({ offset } = timezones[timezone.code]);
        if (offset > 0) {
          offset = `+${offset}`;
        }
      }

      let notime = '';
      if (this.state.hour === '' && this.state.minute === '') {
        notime = 'notime';
      }

      const response = `${year}-${month}-${day} ${hour}:${minute} ${offset} ${timezone ? timezone.code : ''} ${notime}`;

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
    const { fieldset } = this.props;

    let taskTimezones = Object.values(timezones);
    if (this.props.timezones) {
      taskTimezones = JSON.parse(this.props.timezones);
    }

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
          { fieldset === 'tasks' ? (
            <FormattedMessage
              id="datetimeRespondTask.answerTask"
              defaultMessage="Answer task"
            />
          ) :
            <FormattedGlobalMessage messageKey="save" />
          }
        </Button>
      </p>
    );

    return (
      <div>
        <Box clone mb={2}>
          <FlexRow >
            <Box clone flex={10}>
              <DatePicker
                label={
                  <FormattedMessage
                    id="datetimeRespondTask.pickDate"
                    defaultMessage="Pick a date"
                  />
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment>
                      <EventIcon />
                    </InputAdornment>
                  ),
                }}
                id="task__response-date"
                className="task__response-input"
                name="response"
                value={this.state.date}
                onChange={this.handleChange.bind(this)}
                disableToolbar
                inputVariant="outlined"
                variant="inline"
                format="MMMM DD, YYYY"
                margin="normal"
              />
            </Box>
          </FlexRow>
        </Box>

        <Box clone mb={2}>
          <FlexRow >
            <Box clone flex={10} >
              <Box clone justifyContent='flex-start' alignItems='center'>
                <FlexRow
                  id="task__response-time"
                >
                  <TimePicker
                    id="task__response-time-input"
                    label={
                      <FormattedMessage
                        id="datetimeRespondTask.time"
                        defaultMessage="Pick a time"
                      />
                    }
                    onChange={this.handleChangeTime.bind(this)}
                    value={
                      this.state.hour && this.state.minute ?
                        new Date().setHours(this.state.hour, this.state.minute) : null
                    }
                    inputVariant="outlined"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment>
                          <AccessTimeIcon />
                        </InputAdornment>
                      ),
                    }}
                    variant="inline"
                    fullWidth
                  />
                  <Box clone ml={2}>
                    <Autocomplete
                      className="task__datetime-timezone"
                      options={
                        taskTimezones && taskTimezones.length ? taskTimezones : Object.values(timezones)
                      }
                      getOptionLabel={option => option.label}
                      defaultValue={this.state.timezone}
                      onChange={(event, newValue) => {
                        this.handleChangeTimezone(newValue);
                      }}
                      renderInput={params => (
                        <TextField
                          {...params}
                          variant="outlined"
                          label={
                            <FormattedMessage
                              id="datetimeRespondTask.timezone"
                              defaultMessage="Select a timezone"
                            />
                          }
                        />
                      )}
                      fullWidth
                    />
                  </Box>
                </FlexRow>
              </Box>
            </Box>
          </FlexRow>  
        </Box>
        <Box color={alertRed} display="block" fontFamily="caption">
          {this.state.timeError ? this.state.timeError : ''}
        </Box>
        { this.state.focus || this.props.response ? actionBtns : null }
      </div>
    );
  }
}

export default DatetimeRespondTask;
