import React from 'react';
import PropTypes from 'prop-types';
import Card, { CardHoverContext } from '../../cds/media-cards/Card';
import TeamAvatar from '../../team/TeamAvatar';
import ItemDate from '../../cds/media-cards/ItemDate';
import ItemRating from '../../cds/media-cards/ItemRating';
import ItemDescription from '../../cds/media-cards/ItemDescription';
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
      footer={<TeamAvatar team={{ avatar: teamAvatar }} size="30px" />}
    >
      <div className={styles.factCheckCardDescription}>
        <CardHoverContext.Consumer>
          { isHovered => (
            <ItemDescription title={title} description={summary} factCheckUrl={url} showCollapseButton={isHovered} />
          )}
        </CardHoverContext.Consumer>
      </div>
      { (statusLabel || date) ?
        <div className={styles.cardRight}>
          { statusLabel ? <ItemRating rating={statusLabel} ratingColor={statusColor} /> : null }
          { date ? <ItemDate date={date} /> : null }
        </div> : null
      }
    </Card>
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
