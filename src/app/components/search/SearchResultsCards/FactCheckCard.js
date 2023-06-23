import React from 'react';
import PropTypes from 'prop-types';
import { FormattedDate } from 'react-intl';
import Card from '../../cds/media-cards/Card';
import styles from './FactCheckCard.module.css';

const FactCheckCard = ({
  title,
  statusLabel,
  statusColor,
  date,
  summary,
  url,
}) => (
  <div className={styles.factCheckCard}>
    <Card
      title={title}
      description={summary}
      tag={statusLabel}
      tagColor={statusColor}
      url={url}
      footer={<FormattedDate value={date * 1000} year="numeric" month="long" day="numeric" />}
    />
  </div>
);

FactCheckCard.defaultProps = {
  summary: null,
  url: null,
  statusColor: 'black',
};

FactCheckCard.propTypes = {
  title: PropTypes.string.isRequired,
  statusLabel: PropTypes.string.isRequired,
  statusColor: PropTypes.string,
  date: PropTypes.number.isRequired, // Timestamp
  summary: PropTypes.string,
  url: PropTypes.string,
};

export default FactCheckCard;
