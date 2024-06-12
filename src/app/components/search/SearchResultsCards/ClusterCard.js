import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import cx from 'classnames/bind';
import Card, { CardHoverContext } from '../../cds/media-cards/Card';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import Checkbox from '../../cds/buttons-checkboxes-chips/Checkbox';
import ItemThumbnail from '../SearchResultsTable/ItemThumbnail';
import ItemDescription from '../../cds/media-cards/ItemDescription';
import ItemDate from '../../cds/media-cards/ItemDate';
import ItemRating from '../../cds/media-cards/ItemRating';
import ItemWorkspaces from '../../cds/media-cards/ItemWorkspaces';
import SharedItemCardFooter from './SharedItemCardFooter';
import CheckFeedDataPoints from '../../../CheckFeedDataPoints';
import FactCheckIcon from '../../../icons/fact_check.svg';
import styles from './ItemCard.module.css';
import ItemReportStatus from '../../cds/media-cards/ItemReportStatus';

const ClusterCard = ({
  cardUrl,
  channels,
  className,
  dataPoints,
  date,
  description,
  isChecked,
  isUnread,
  isPublished,
  factCheckCount,
  factCheckUrl,
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
}) => {
  let feedContainsFactChecks = null;

  if (dataPoints) {
    feedContainsFactChecks = dataPoints.includes(CheckFeedDataPoints.PUBLISHED_FACT_CHECKS);
  }

  return (
    <div
      className={cx(
        styles.itemCard,
        'cluster-card',
        {
          [className]: true,
          [styles.listItemSelected]: isChecked,
        },
      )}
    >
      <Card
        className={cx(
          {
            [styles.listItemUnread]: isUnread,
          },
        )}
        cardUrl={cardUrl}
      >
        <div className={styles.clusterCardLeft}>
          { onCheckboxChange && (<Checkbox checked={isChecked} onChange={onCheckboxChange} className={[styles.checkbox]} />)}
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
          <ItemWorkspaces workspaces={workspaces} />
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
        <div className={styles.clusterCardRight}>
          <div className={styles.clusterCardRating}>
            { (factCheckCount && feedContainsFactChecks) ? (
              <ButtonMain
                disabled
                buttonProps={{
                  type: null,
                }}
                size="small"
                theme="lightBrand"
                iconLeft={<FactCheckIcon />}
                variant="contained"
                label={
                  <FormattedMessage
                    id="sharedItemCard.factCheckCount"
                    defaultMessage="{count, plural, one {# Fact-check} other {# Fact-checks}}"
                    description="A label showing the number of fact-checks represented in an item."
                    values={{
                      count: factCheckCount,
                    }}
                  />
                }
              />
            ) : (
              <>
                <ItemRating rating={rating} ratingColor={ratingColor} size="small" />
                {rating && <ItemReportStatus isPublished={isPublished} publishedAt={publishedAt} /> }
              </>
            ) }
          </div>
          { date ? <ItemDate date={date} tooltipLabel={<FormattedMessage id="sharedItemCard.lastUpdated" defaultMessage="Last Updated" description="This appears as a label before a date with a colon between them, like 'Last Updated: May 5, 2023'." />} /> : null }
        </div>
      </Card>
    </div>
  );
};

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
