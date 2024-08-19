/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import cx from 'classnames/bind';
import SharedItemCardFooter from './SharedItemCardFooter';
import Card, { CardHoverContext } from '../../cds/media-cards/Card';
import Checkbox from '../../cds/buttons-checkboxes-chips/Checkbox';
import ItemThumbnail from '../../cds/media-cards/ItemThumbnail';
import ItemArticlesOrFactCheck from '../../cds/media-cards/ItemArticlesOrFactCheck';
import ItemDescription from '../../cds/media-cards/ItemDescription';
import ItemDate from '../../cds/media-cards/ItemDate';
import ItemWorkspaces from '../../cds/media-cards/ItemWorkspaces';
import styles from './ItemCard.module.css';

const ClusterCard = ({
  articlesCount,
  cardUrl,
  channels,
  className,
  dataPoints,
  date,
  description,
  factCheckCount,
  factCheckUrl,
  isChecked,
  isPublished,
  isUnread,
  lastRequestDate,
  mediaCount,
  mediaThumbnail,
  mediaType,
  onCheckboxChange,
  publishedAt,
  rating,
  ratingColor,
  requestsCount,
  suggestionsCount,
  title,
  workspaces,
}) => (
  <div
    className={cx(
      styles.itemCard,
      'cluster-card',
      {
        [className]: true,
        [styles.listItemSelected]: isChecked,
        [styles.listItemUnread]: isUnread,
      },
    )}
  >
    <Card cardUrl={cardUrl} className={styles.clusterCard}>
      <div className={styles.clusterCardLeft}>
        { onCheckboxChange && (<Checkbox checked={isChecked} className={styles.checkbox} onChange={onCheckboxChange} />)}
        <ItemThumbnail
          maskContent={mediaThumbnail?.show_warning_cover}
          picture={mediaThumbnail?.media?.picture}
          type={mediaThumbnail?.media?.type}
          url={mediaThumbnail?.media?.url}
        />
      </div>
      <div className={styles.sharedItemCardMiddle}>
        <CardHoverContext.Consumer>
          { isHovered => (
            <ItemDescription
              description={description}
              showCollapseButton={isHovered}
              title={title}
              url={factCheckUrl}
              variant="fact-check"
            />
          )}
        </CardHoverContext.Consumer>
        <ItemWorkspaces workspaces={workspaces} />
        <div>
          <SharedItemCardFooter
            channels={channels}
            lastRequestDate={lastRequestDate}
            mediaCount={mediaCount}
            mediaType={mediaType || mediaThumbnail?.media?.type}
            requestsCount={requestsCount}
            suggestionsCount={suggestionsCount}
          />
        </div>
      </div>
      <div className={styles.clusterCardRight}>
        <div className={styles.clusterCardRating}>
          <ItemArticlesOrFactCheck
            articlesCount={articlesCount}
            dataPoints={dataPoints}
            factCheckCount={factCheckCount}
            isPublished={isPublished}
            publishedAt={publishedAt}
            rating={rating}
            ratingColor={ratingColor}
          />
        </div>
        <ItemDate date={date} tooltipLabel={<FormattedMessage defaultMessage="Last Updated" description="This appears as a label before a date with a colon between them, like 'Last Updated: May 5, 2023'." id="sharedItemCard.lastUpdated" />} />
      </div>
    </Card>
  </div>
);

ClusterCard.defaultProps = {
  cardUrl: null,
  channels: null,
  className: null,
  dataPoints: [],
  description: null,
  factCheckCount: null,
  factCheckUrl: null,
  isChecked: false,
  isUnread: false,
  isPublished: false,
  lastRequestDate: null,
  mediaCount: null,
  mediaThumbnail: null,
  mediaType: null,
  onCheckboxChange: null,
  publishedAt: null,
  rating: null,
  ratingColor: null,
  requestsCount: null,
  suggestionsCount: null,
  workspaces: [],
};

ClusterCard.propTypes = {
  cardUrl: PropTypes.string,
  channels: PropTypes.exact({
    main: PropTypes.number,
    others: PropTypes.arrayOf(PropTypes.number),
  }),
  className: PropTypes.string,
  dataPoints: PropTypes.arrayOf(PropTypes.number),
  date: PropTypes.instanceOf(Date).isRequired, // Timestamp
  description: PropTypes.string,
  factCheckCount: PropTypes.number,
  factCheckUrl: PropTypes.string,
  isChecked: PropTypes.bool,
  isUnread: PropTypes.bool,
  isPublished: PropTypes.bool,
  lastRequestDate: PropTypes.instanceOf(Date),
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
  onCheckboxChange: PropTypes.func,
  publishedAt: PropTypes.instanceOf(Date), // Timestamp
  rating: PropTypes.string,
  ratingColor: PropTypes.string,
  requestsCount: PropTypes.number,
  suggestionsCount: PropTypes.number,
  title: PropTypes.string.isRequired,
  workspaces: PropTypes.arrayOf(PropTypes.exact({
    name: PropTypes.string,
    url: PropTypes.string,
  })),
};

export default injectIntl(ClusterCard);
