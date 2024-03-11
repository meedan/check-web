import React from 'react';
import PropTypes from 'prop-types';
import Card from '../cds/media-cards/Card';
import SharedItemCardFooter from '../search/SearchResultsCards/SharedItemCardFooter';
import TeamAvatar from '../team/TeamAvatar';
import styles from './FeedItem.module.css';

const FeedTeamCard = ({
  teamName,
  teamAvatar,
  mediaCount,
  requestsCount,
  lastRequestDate,
}) => (
  <Card className={styles.feedItemTeamCard}>
    <TeamAvatar team={{ avatar: teamAvatar }} size="54px" />
    <div>
      <div>
        <h6 className="typography-button">{teamName}</h6>
      </div>
      <div>
        <SharedItemCardFooter
          buttonProps={{
            variant: 'text',
            theme: 'text',
          }}
          mediaCount={mediaCount}
          requestsCount={requestsCount}
          lastRequestDate={lastRequestDate}
        />
      </div>
    </div>
  </Card>
);

FeedTeamCard.defaultProps = {
  mediaCount: null,
  requestsCount: null,
  lastRequestDate: null,
};

FeedTeamCard.propTypes = {
  teamName: PropTypes.string.isRequired,
  teamAvatar: PropTypes.string.isRequired,
  mediaCount: PropTypes.number,
  requestsCount: PropTypes.number,
  lastRequestDate: PropTypes.instanceOf(Date),
};

export default FeedTeamCard;
