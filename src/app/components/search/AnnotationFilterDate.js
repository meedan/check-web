import React from 'react';
import { FormattedMessage } from 'react-intl';
import { DatePicker } from '@material-ui/pickers';
import cx from 'classnames/bind';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import CloseIcon from '../../icons/clear.svg';
import KeyboardArrowDownIcon from '../../icons/chevron_down.svg';
import styles from './search.module.css';

function buildValue(startTimeOrNull, endTimeOrNull) {
  const range = {};
  if (startTimeOrNull) {
    range.start_time = startTimeOrNull;
  }
  if (endTimeOrNull) {
    range.end_time = endTimeOrNull;
  }
  return { range };
}

function parseStartDateAsISOString(moment) {
  const date = moment.toDate();
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
}

function parseEndDateAsISOString(moment) {
  const date = moment.toDate();
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59).toISOString();
}

class AnnotationFilterDate extends React.Component {
  getDateStringOrNull(field) {
    const { query, teamTask } = this.props;
    const teamTaskValue = query.team_tasks.find(tt => tt.id.toString() === teamTask.node.dbid.toString());
    const { range } = teamTaskValue;
    const value = range && range[field] !== undefined ? range[field] : null;
    return value;
  }

  get startDateStringOrNull() {
    return this.getDateStringOrNull('start_time');
  }

  get endDateStringOrNull() {
    return this.getDateStringOrNull('end_time');
  }

  handleChangeStartDate = (moment) => {
    this.props.onChange(['DATE_RANGE'], buildValue(
      parseStartDateAsISOString(moment),
      this.endDateStringOrNull,
    ));
  }

  handleChangeEndDate = (moment) => {
    this.props.onChange(['DATE_RANGE'], buildValue(
      this.startDateStringOrNull,
      parseEndDateAsISOString(moment),
    ));
  }

  handleClearDate = (event, field) => {
    event.stopPropagation();
    const { query, teamTask } = this.props;
    const teamTaskValue = query.team_tasks.find(tt => tt.id.toString() === teamTask.node.dbid.toString());
    const { range } = teamTaskValue;
    range[field] = null;
    this.props.onChange(['DATE_RANGE'], { range });
  }

  render() {
    return (
      <>
        <DatePicker
          TextFieldComponent={({ onClick, params, value: valueText }) => (
            <>
              <ButtonMain
                customStyle={{ color: 'var(--color-gray-15' }}
                disabled
                label={<FormattedMessage defaultMessage="after" description="String displayed before a date picker" id="search.afterDate" />}
                size="small"
                theme="text"
                variant="text"
              />
              <ButtonMain
                className={cx(
                  'int-annotation-filter__button--start-date',
                  {
                    [styles['filter-date']]: valueText,
                  })
                }
                iconRight={!valueText && <KeyboardArrowDownIcon />}
                label={
                  !valueText ?
                    <FormattedMessage defaultMessage="any date" description="Date picker placeholder" id="search.anyDate" />
                    :
                    valueText
                }
                size="small"
                theme={valueText ? 'info' : 'text'}
                variant="contained"
                onClick={onClick}
                {...params}
              />
              { valueText &&
                <Tooltip
                  arrow
                  title={
                    <FormattedMessage defaultMessage="Remove start date" description="Tooltip to tell the user they can add remove the start date portion of this filter" id="search.removeStartDateCondition" />
                  }
                >
                  <span className={styles['filter-date-remove']}>
                    <ButtonMain
                      className="int-annotation-filter__button--clear-start-date"
                      iconCenter={<CloseIcon />}
                      size="small"
                      theme="info"
                      variant="contained"
                      onClick={e => this.handleClearDate(e, 'start_time')}
                    />
                  </span>
                </Tooltip>
              }
            </>
          )}
          cancelLabel={<FormattedMessage defaultMessage="Cancel" description="Generic label for a button or link for a user to press when they wish to abort an in-progress operation" id="global.cancel" />}
          maxDate={this.endDateStringOrNull || undefined}
          okLabel={<FormattedMessage defaultMessage="OK" description="Generic label for a button or link for a user to press when they wish to confirm an action" id="global.ok" />}
          style={{ margin: '0 16px' }}
          value={this.startDateStringOrNull}
          onChange={this.handleChangeStartDate}
        />
        <DatePicker
          TextFieldComponent={({ onClick, params, value: valueText }) => (
            <>
              <ButtonMain
                customStyle={{ color: 'var(--color-gray-15' }}
                disabled
                label={<FormattedMessage defaultMessage="and before" description="String displayed between after and before date pickers" id="search.beforeDate" />}
                size="small"
                theme="text"
                variant="text"
              />
              <ButtonMain
                className={cx(
                  'int-annotation-filter__button--end-date',
                  {
                    [styles['filter-date']]: valueText,
                  })
                }
                iconRight={!valueText && <KeyboardArrowDownIcon />}
                label={
                  !valueText ?
                    <FormattedMessage defaultMessage="any date" description="Date picker placeholder" id="search.anyDate" />
                    :
                    valueText
                }
                size="small"
                theme={valueText ? 'info' : 'text'}
                variant="contained"
                onClick={onClick}
                {...params}
              />
              { valueText &&
                <Tooltip
                  arrow
                  title={
                    <FormattedMessage defaultMessage="Remove end date" description="Tooltip to tell the user they can add remove the end date portion of this filter" id="search.removeEndDateCondition" />
                  }
                >
                  <span className={styles['filter-date-remove']}>
                    <ButtonMain
                      className="int-annotation-filter__button--clear-end-date"
                      iconCenter={<CloseIcon />}
                      size="small"
                      theme="info"
                      variant="contained"
                      onClick={e => this.handleClearDate(e, 'end_time')}
                    />
                  </span>
                </Tooltip>
              }
            </>
          )}
          cancelLabel={<FormattedMessage defaultMessage="Cancel" description="Generic label for a button or link for a user to press when they wish to abort an in-progress operation" id="global.cancel" />}
          inputVariant="outlined"
          minDate={this.startDateStringOrNull || undefined}
          okLabel={<FormattedMessage defaultMessage="OK" description="Generic label for a button or link for a user to press when they wish to confirm an action" id="global.ok" />}
          value={this.endDateStringOrNull}
          onChange={this.handleChangeEndDate}
        />
      </>
    );
  }
}

export default AnnotationFilterDate;
