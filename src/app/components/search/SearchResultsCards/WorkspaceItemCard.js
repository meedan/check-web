import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames/bind';
import Card, { CardHoverContext } from '../../cds/media-cards/Card';
import Checkbox from '../../cds/buttons-checkboxes-chips/Checkbox';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import ItemThumbnail from '../SearchResultsTable/ItemThumbnail';
import ItemDescription from '../../cds/media-cards/ItemDescription';
import ItemDate from '../../cds/media-cards/ItemDate';
import ItemRating from '../../cds/media-cards/ItemRating';
import FactCheckIcon from '../../../icons/fact_check.svg';
import SharedItemCardFooter from './SharedItemCardFooter';
import styles from './ItemCard.module.css';

const WorkspaceItemCard = ({
  cardUrl,
  channels,
  className,
  date,
  description,
  factCheckUrl,
  isChecked,
  isUnread,
  isPublished,
  lastRequestDate,
  mediaCount,
  mediaThumbnail,
  mediaType,
  onCheckboxChange,
  rating,
  ratingColor,
  requestsCount,
  suggestionsCount,
  title,
}) => (
  <div className={cx(styles.itemCard, 'workspace-item--card', className)}>
    <Card
      className={cx({ [styles.listItemUnread]: isUnread })}
      cardUrl={cardUrl}
    >
      { onCheckboxChange && (
        <div className={styles.checkbox}>
          <Checkbox checked={isChecked} onChange={onCheckboxChange} />
        </div>)}
      <div className={styles.sharedItemCardLeft}>
        <ItemThumbnail
          picture={mediaThumbnail?.media?.picture}
          maskContent={mediaThumbnail?.show_warning_cover}
          type={mediaThumbnail?.media?.type}
          url={mediaThumbnail?.media?.url}
        />
      </div>
      <div className={styles.sharedItemCardMiddle}>
        <CardHoverContext.Consumer>
          { isHovered => (
            <ItemDescription
              title={title}
              description={description}
              url={factCheckUrl}
              showCollapseButton={isHovered}
              variant="fact-check"
            />
          )}
        </CardHoverContext.Consumer>
        <div>
          <SharedItemCardFooter
            mediaCount={mediaCount}
            mediaType={mediaType || mediaThumbnail?.media?.type}
            requestsCount={requestsCount}
            suggestionsCount={suggestionsCount}
            lastRequestDate={lastRequestDate}
            channels={channels}
          />
        </div>
      </div>
      <div className={styles.sharedItemCardRight}>
        <div className={styles.workspaceItemCardRating}>
          <ItemRating rating={rating} ratingColor={ratingColor} size="small" />
          <div className={cx({ [styles.publishedLabel]: isPublished })}><ButtonMain variant="contained" size="small" iconCenter={<FactCheckIcon />} disabled /></div>
        </div>
        { date && <ItemDate date={date} tooltipLabel={<FormattedMessage id="sharedItemCard.lastUpdated" defaultMessage="Last Updated" description="This appears as a label before a date with a colon between them, like 'Last Updated: May 5, 2023'." />} />}
      </div>
    </Card>
  </div>
);

WorkspaceItemCard.defaultProps = {
  cardUrl: null,
  channels: null,
  className: null,
  description: null,
  factCheckUrl: null,
  isChecked: false,
  isUnread: false,
  isPublished: false,
  lastRequestDate: null,
  mediaCount: null,
  mediaThumbnail: null,
  mediaType: null,
  onCheckboxChange: null,
  rating: null,
  ratingColor: null,
  requestsCount: null,
  suggestionsCount: null,
};


WorkspaceItemCard.propTypes = {
  cardUrl: PropTypes.string,
  channels: PropTypes.exact({
    main: PropTypes.number,
    others: PropTypes.arrayOf(PropTypes.number),
  }),
  className: PropTypes.string,
  date: PropTypes.instanceOf(Date).isRequired, // Timestamp
  description: PropTypes.string,
  factCheckUrl: PropTypes.string,
  isChecked: PropTypes.bool,
  isPublished: PropTypes.bool,
  isUnread: PropTypes.bool,
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
  rating: PropTypes.string,
  ratingColor: PropTypes.string,
  requestsCount: PropTypes.number,
  suggestionsCount: PropTypes.number,
  title: PropTypes.string.isRequired,
};

export default WorkspaceItemCard;
