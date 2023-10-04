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
          onChange={this.handleChangeStartDate}
          maxDate={this.endDateStringOrNull || undefined}
          okLabel={<FormattedMessage id="global.ok" defaultMessage="OK" description="Generic label for a button or link for a user to press when they wish to confirm an action" />}
          cancelLabel={<FormattedMessage id="global.cancel" defaultMessage="Cancel" description="Generic label for a button or link for a user to press when they wish to abort an in-progress operation" />}
          value={this.startDateStringOrNull}
          style={{ margin: '0 16px' }}
          TextFieldComponent={({ params, onClick, value: valueText }) => (
            <>
              <ButtonMain
                disabled
                theme="text"
                size="small"
                variant="text"
                customStyle={{ color: 'var(--textPrimary' }}
                label={<FormattedMessage id="search.afterDate" defaultMessage="after" description="String displayed before a date picker" />}
              />
              <ButtonMain
                className={cx(
                  'int-annotation-filter__button--start-date',
                  {
                    [styles['filter-date']]: valueText,
                  })
                }
                size="small"
                variant="contained"
                theme={valueText ? 'brand' : 'text'}
                iconRight={!valueText && <KeyboardArrowDownIcon />}
                label={
                  !valueText ?
                    <FormattedMessage id="search.anyDate" defaultMessage="any date" description="Date picker placeholder" />
                    :
                    valueText
                }
                onClick={onClick}
                {...params}
              />
              { valueText &&
                <Tooltip
                  title={
                    <FormattedMessage id="search.removeStartDateCondition" defaultMessage="Remove start date" description="Tooltip to tell the user they can add remove the start date portion of this filter" />
                  }
                  arrow
                >
                  <span className={styles['filter-date-remove']}>
                    <ButtonMain
                      className="int-annotation-filter__button--clear-start-date"
                      iconCenter={<CloseIcon />}
                      onClick={e => this.handleClearDate(e, 'start_time')}
                      theme="brand"
                      variant="contained"
                      size="small"
                    />
                  </span>
                </Tooltip>
              }
            </>
          )}
        />
        <DatePicker
          inputVariant="outlined"
          onChange={this.handleChangeEndDate}
          minDate={this.startDateStringOrNull || undefined}
          okLabel={<FormattedMessage id="global.ok" defaultMessage="OK" description="Generic label for a button or link for a user to press when they wish to confirm an action" />}
          cancelLabel={<FormattedMessage id="global.cancel" defaultMessage="Cancel" description="Generic label for a button or link for a user to press when they wish to abort an in-progress operation" />}
          value={this.endDateStringOrNull}
          TextFieldComponent={({ params, onClick, value: valueText }) => (
            <>
              <ButtonMain
                disabled
                theme="text"
                size="small"
                variant="text"
                customStyle={{ color: 'var(--textPrimary' }}
                label={<FormattedMessage id="search.beforeDate" defaultMessage="and before" description="String displayed between after and before date pickers" />}
              />
              <ButtonMain
                className={cx(
                  'int-annotation-filter__button--end-date',
                  {
                    [styles['filter-date']]: valueText,
                  })
                }
                size="small"
                variant="contained"
                theme={valueText ? 'brand' : 'text'}
                iconRight={!valueText && <KeyboardArrowDownIcon />}
                label={
                  !valueText ?
                    <FormattedMessage id="search.anyDate" defaultMessage="any date" description="Date picker placeholder" />
                    :
                    valueText
                }
                onClick={onClick}
                {...params}
              />
              { valueText &&
                <Tooltip
                  title={
                    <FormattedMessage id="search.removeEndDateCondition" defaultMessage="Remove end date" description="Tooltip to tell the user they can add remove the end date portion of this filter" />
                  }
                  arrow
                >
                  <span className={styles['filter-date-remove']}>
                    <ButtonMain
                      className="int-annotation-filter__button--clear-end-date"
                      iconCenter={<CloseIcon />}
                      onClick={e => this.handleClearDate(e, 'end_time')}
                      theme="brand"
                      variant="contained"
                      size="small"
                    />
                  </span>
                </Tooltip>
              }
            </>
          )}
        />
      </>
    );
  }
}

export default AnnotationFilterDate;
