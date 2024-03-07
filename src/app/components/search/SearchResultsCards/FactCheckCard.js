import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Card, { CardHoverContext } from '../../cds/media-cards/Card';
import TeamAvatar from '../../team/TeamAvatar';
import ItemDate from '../../cds/media-cards/ItemDate';
import Tooltip from '../../cds/alerts-and-prompts/Tooltip';
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
  teamName,
}) => (
  <div className={`${styles.factCheckCard} fact-check-card`}>
    <Card
      footer={
        <Tooltip title={teamName}>
          <span>
            <TeamAvatar team={{ avatar: teamAvatar }} size="30px" />
          </span>
        </Tooltip>
      }
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
          { date ?
            <ItemDate
              date={date * 1000}
              tooltipLabel={<FormattedMessage id="factCheckCard.dateLabel" defaultMessage="Published at" description="Date tooltip label for fact-check cards" />}
            /> : null
          }
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
