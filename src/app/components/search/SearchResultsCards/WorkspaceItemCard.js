import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames/bind';
import Card, { CardHoverContext } from '../../cds/media-cards/Card';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import MediaCount from '../../cds/media-cards/MediaCount';
import RequestsCount from '../../cds/media-cards/RequestsCount';
import LastRequestDate from '../../cds/media-cards/LastRequestDate';
import ItemThumbnail from '../SearchResultsTable/ItemThumbnail';
import ItemDescription from '../../cds/media-cards/ItemDescription';
import ItemDate from '../../cds/media-cards/ItemDate';
import ItemChannels from '../../cds/media-cards/ItemChannels';
import ItemRating from '../../cds/media-cards/ItemRating';
import BulletSeparator from '../../layout/BulletSeparator';
import FactCheckIcon from '../../../icons/fact_check.svg';
import styles from './ItemCard.module.css';

const WorkspaceItemCard = ({
  channels,
  date,
  description,
  factCheckUrl,
  isUnread,
  isPublished,
  lastRequestDate,
  mediaCount,
  mediaThumbnail,
  mediaType,
  rating,
  ratingColor,
  requestsCount,
  title,
}) => {
  // eslint-disable-next-line
  console.log('~~~',isUnread);

  return (
    <div className={cx(styles.itemCard, 'workspace-item--card')}>
      <Card className={cx({ [styles.listItemUnread]: isUnread })}>
        <div className={styles.sharedItemCardLeft}>
          <ItemThumbnail picture={mediaThumbnail?.media?.picture} maskContent={mediaThumbnail?.show_warning_cover} type={mediaThumbnail?.media?.type} url={mediaThumbnail?.media?.url} />
        </div>
        <div className={styles.sharedItemCardMiddle}>
          <CardHoverContext.Consumer>
            { isHovered => (
              <ItemDescription title={title} description={description} factCheckUrl={factCheckUrl} showCollapseButton={isHovered} />
            )}
          </CardHoverContext.Consumer>
          <div>
            <BulletSeparator
              className={styles.bulletSeparator}
              compact
              details={[
                mediaCount && (
                  <MediaCount
                    mediaCount={mediaCount}
                    mediaType={mediaType}
                  />
                ),
                requestsCount && (
                  <RequestsCount
                    requestsCount={requestsCount}
                  />
                ),
                lastRequestDate && (
                  <LastRequestDate
                    lastRequestDate={lastRequestDate}
                  />
                ),
                channels && <ItemChannels channels={channels} sortMainFirst />,
              ]}
            />
          </div>
        </div>
        <div className={styles.sharedItemCardRight}>
          <div className={styles.workspaceItemCardRating}>
            <ItemRating rating={rating} ratingColor={ratingColor} size="small" />
            { isPublished && <div className={styles.publishedLabel}><ButtonMain variant="contained" size="small" iconCenter={<FactCheckIcon />} disabled /></div> }
          </div>
          { date && <ItemDate date={date} tooltipLabel={<FormattedMessage id="sharedItemCard.lastUpdated" defaultMessage="Last Updated" description="This appears as a label before a date with a colon between them, like 'Last Updated: May 5, 2023'." />} />}
        </div>
      </Card>
    </div>
  );
};

WorkspaceItemCard.defaultProps = {
  description: null,
  factCheckUrl: null,
  isUnread: false,
  isPublished: false,
  mediaCount: null,
  mediaThumbnail: null,
  mediaType: null,
  rating: null,
  ratingColor: null,
};


WorkspaceItemCard.propTypes = {
  date: PropTypes.string.isRequired,
  description: PropTypes.string,
  factCheckUrl: PropTypes.string,
  isUnread: PropTypes.bool,
  isPublished: PropTypes.bool,
  mediaCount: PropTypes.number,
  mediaThumbnail: PropTypes.exact({
    media: PropTypes.exact({
      picture: PropTypes.string, // url
      type: PropTypes.string,
      url: PropTypes.string,
    }),
    show_warning_cover: PropTypes.bool,
  }),
  mediaType: PropTypes.string,
  rating: PropTypes.string,
  ratingColor: PropTypes.string,
  title: PropTypes.string.isRequired,
};

export default WorkspaceItemCard;
