import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import Tooltip from '../alerts-and-prompts/Tooltip';
import SearchIcon from '../../../icons/search.svg';
import FactCheckIcon from '../../../icons/fact_check.svg';
import EditNoteIcon from '../../../icons/edit_note.svg';
import RecommendIcon from '../../../icons/recommend.svg';
import DownVoteIcon from '../../../icons/downvote.svg';
import styles from './RequestReceipt.module.css';

const messages = defineMessages({
  smooch_report_sent_at: {
    id: 'requestReceipt.articleSent',
    defaultMessage: 'Article sent on {date}',
    description: 'Message displayed when user request has an article sent',
  },
  smooch_report_received_at: {
    id: 'requestReceipt.articleDelivered',
    defaultMessage: 'Article delivered on {date}',
    description: 'Message displayed when user request has an article delivered',
  },
  smooch_report_correction_sent_at: {
    id: 'requestReceipt.updateSent',
    defaultMessage: 'Correction sent on {date}',
    description: 'Message displayed when user request has an article update sent',
  },
  smooch_report_update_received_at: {
    id: 'requestReceipt.updateDelivered',
    defaultMessage: 'Correction delivered on {date}',
    description: 'Message displayed when user request has an article update delivered',
  },
  timeout_search_requests: {
    id: 'requestReceipt.noFeedback',
    defaultMessage: 'Search result – no feedback',
    description: 'Message displayed when user has given no feedback over the fact-check sent for this request',
  },
  relevant_search_result_requests: {
    id: 'requestReceipt.positiveFeedback',
    defaultMessage: 'Search result – positive feedback',
    description: 'Message displayed when user has given a positive feedback over the fact-check sent for this request',
  },
  irrelevant_search_result_requests: {
    id: 'requestReceipt.negativeFeedback',
    defaultMessage: 'Search result – negative feedback',
    description: 'Message displayed when user has given a negative feedback over the fact-check sent for this request',
  },
  default_requests: {
    id: 'requestReceipt.default',
    defaultMessage: 'No results returned',
    description: 'Message displayed when no results are returned for this request',
  },
});

const RequestReceipt = ({ events, intl }) => {
  if (!events?.length) {
    return null;
  }

  const formatDate = timestamp => timestamp ?
    new Date(parseInt(timestamp, 10) * 1000)
      .toLocaleDateString(intl.locale, { month: 'short', year: 'numeric', day: '2-digit' }) : null;

  const receiptTypes = {
    smooch_report_sent_at: {
      icon: <FactCheckIcon />,
      color: 'yellow',
    },
    smooch_report_received_at: {
      icon: <FactCheckIcon />,
      color: 'green',
    },
    smooch_report_correction_sent_at: {
      icon: <EditNoteIcon />,
      color: 'yellow',
    },
    smooch_report_update_received_at: {
      icon: <EditNoteIcon />,
      color: 'green',
    },
    timeout_search_requests: {
      icon: <SearchIcon />,
      color: 'yellow',
    },
    relevant_search_result_requests: {
      icon: <RecommendIcon />,
      color: 'green',
    },
    irrelevant_search_result_requests: {
      icon: <DownVoteIcon />,
      color: 'pink',
    },
    default_requests: {
      icon: <SearchIcon />,
      color: 'gray',
    },
  };

  const lastEvent = events.slice(-1)[0];
  const data = receiptTypes[lastEvent?.type];
  data.label = intl.formatMessage(messages[lastEvent?.type], { date: formatDate(lastEvent?.date) });

  const tooltipContent = (
    <ul className="bulleted-list">
      {events.map(e => (
        <li key={e.type}>
          {intl.formatMessage(messages[e.type], { date: formatDate(e.date) })}
        </li>
      ))}
    </ul>
  );

  return (
    <Tooltip arrow title={tooltipContent}>
      <div className={cx(styles['receipt-wrapper'], styles[`receipt-${data.color}`])}>
        <span className={styles['receipt-icon']}>{data.icon}</span>
        <span className="typography-body2">{data.label}</span>
      </div>
    </Tooltip>
  );
};

RequestReceipt.propTypes = {
  events: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.string.isRequired,
    date: PropTypes.number,
  })).isRequired,
};

export default injectIntl(RequestReceipt);
