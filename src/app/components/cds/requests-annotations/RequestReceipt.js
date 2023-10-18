import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import styles from './RequestReceipt.module.css';
import SearchIcon from '../../../icons/search.svg';
import FactCheckIcon from '../../../icons/fact_check.svg';
import EditNoteIcon from '../../../icons/edit_note.svg';
import RecommendIcon from '../../../icons/recommend.svg';

const RequestReceipt = ({
  icon,
  label,
  color,
  type,
  timestamp,
}) => {
  if (!type && (!icon || !label)) {
    return null;
  }

  const receiptTypes = {
    no_search_result: {
      label: <FormattedMessage id="requestReceipt.noResult" defaultMessage="No search result" description="Message displayed when user request to tipline returns no result" />,
      icon: <SearchIcon />,
      color: 'gray',
    },
    fact_check_sent: {
      label: (
        <FormattedMessage
          id="requestReceipt.factCheckSent"
          defaultMessage="Fact-check sent on {date}"
          description="Message displayed when user request has a fact-check sent"
          values={{ date: timestamp }}
        />
      ),
      icon: <FactCheckIcon />,
      color: 'yellow',
    },
    fact_check_delivered: {
      label: (
        <FormattedMessage
          id="requestReceipt.factCheckDelivered"
          defaultMessage="Fact-check delivered on {date}"
          description="Message displayed when user request has a fact-check delivered"
          values={{ date: timestamp }}
        />
      ),
      icon: <FactCheckIcon />,
      color: 'green',
    },
    update_sent: {
      label: (
        <FormattedMessage
          id="requestReceipt.updateSent"
          defaultMessage="Correction sent on {date}"
          description="Message displayed when user request has a fact-check update sent"
          values={{ date: timestamp }}
        />
      ),
      icon: <EditNoteIcon />,
      color: 'yellow',
    },
    update_delivered: {
      label: <FormattedMessage id="requestReceipt.updateDelivered" defaultMessage="Correction delivered on {date}" description="Message displayed when user request has a fact-check update delivered" />,
      icon: <EditNoteIcon />,
      color: 'green',
    },
    search_result_no_feedback: {
      label: <FormattedMessage id="requestReceipt.noFeedback" defaultMessage="Search result – no feedback" description="Message displayed when user has given no feedback over the fact-check sent for this request" />,
      icon: <SearchIcon />,
      color: 'yellow',
    },
    search_result_positive_feedback: {
      label: <FormattedMessage id="requestReceipt.positiveFeedback" defaultMessage="Search result – positive feedback" description="Message displayed when user has given a positive feedback over the fact-check sent for this request" />,
      icon: <RecommendIcon />,
      color: 'green',
    },
  };

  let data = { icon, label, color };

  if (type) {
    data = receiptTypes[type];
  }

  return (
    <div className={cx(styles['receipt-wrapper'], styles[`receipt-${data.color}`])}>
      <span className={styles['receipt-icon']}>{data.icon}</span>
      <span className="typography-body2">{data.label}</span>
    </div>
  );
};

RequestReceipt.defaultProps = {
  icon: null,
  label: null,
  color: null,
  type: null,
  timestamp: null,
};

RequestReceipt.propTypes = {
  icon: PropTypes.node,
  label: PropTypes.node,
  color: PropTypes.oneOf(['gray', 'green', 'yellow']),
  type: PropTypes.oneOf(['no_search_result', 'fact_check_sent', 'fact_check_delivered', 'update_sent', 'update_delivered', 'search_result_no_feedback', 'search_result_positive_feedback']),
  timestamp: PropTypes.string,
};

export default RequestReceipt;
