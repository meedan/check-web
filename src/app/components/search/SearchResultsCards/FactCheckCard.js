import React from 'react';
import PropTypes from 'prop-types';
import Card from '../../cds/media-cards/Card';
import TeamAvatar from '../../team/TeamAvatar';
import styles from './FactCheckCard.module.css';

const FactCheckCard = ({
  title,
  statusLabel,
  statusColor,
  date,
  summary,
  url,
  teamAvatar,
}) => (
  <div className={`${styles.factCheckCard} fact-check-card`}>
    <Card
      title={title}
      description={summary}
      tag={statusLabel}
      tagColor={statusColor}
      factCheckUrl={url}
      date={date}
      footer={<TeamAvatar team={{ avatar: teamAvatar }} size="30px" />}
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
  teamAvatar: PropTypes.string.isRequired, // URL
};

export default FactCheckCard;
