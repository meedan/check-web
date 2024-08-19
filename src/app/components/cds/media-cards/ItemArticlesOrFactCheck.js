import React from 'react';
import { FormattedMessage } from 'react-intl';
import ItemReportStatus from './ItemReportStatus';
import ItemRating from './ItemRating';
import CheckFeedDataPoints from '../../../CheckFeedDataPoints';
import ButtonMain from '../buttons-checkboxes-chips/ButtonMain';
import BookIcon from '../../../icons/book.svg';
import FactCheckIcon from '../../../icons/fact_check.svg';
import styles from './Card.module.css';

const ItemArticlesOrFactCheck = ({
  articlesCount,
  dataPoints,
  factCheckCount,
  isPublished,
  publishedAt,
  rating,
  ratingColor,
}) => {
  const inSharedFeed = dataPoints.length > 0;
  let feedContainsFactChecks = null;

  if (inSharedFeed) {
    feedContainsFactChecks = dataPoints.includes(CheckFeedDataPoints.PUBLISHED_FACT_CHECKS);
  }

  // Display ItemRating for workspace clusters that have a fact-check
  if (!inSharedFeed && factCheckCount && rating) {
    return (
      <>
        <ItemRating rating={rating} ratingColor={ratingColor} size="small" />
        {rating && <ItemReportStatus isPublished={isPublished} publishedAt={publishedAt} />}
      </>
    );
  // Display Fact-Check count for shared feed clusters
  } else if (inSharedFeed && feedContainsFactChecks && factCheckCount > 0) {
    return (
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
            id="itemArticlesOrFactCheck.factCheckCount"
            defaultMessage="{count, plural, one {# Fact-check} other {# Fact-checks}}"
            description="A label showing the number of fact-checks represented in an item."
            values={{
              count: factCheckCount,
            }}
          />
        }
      />
    );
  // Display Article count for workspace clusters that have articles but no fact-check
  } else if (!inSharedFeed && articlesCount > 0 && !factCheckCount) {
    return (
      <ButtonMain
        disabled
        buttonProps={{
          type: null,
        }}
        size="small"
        theme="lightBrand"
        iconLeft={<BookIcon />}
        variant="contained"
        label={
          <FormattedMessage
            id="itemArticlesOrFactCheck.articleCount"
            defaultMessage="{count, plural, one {# Article} other {# Articles}}"
            description="A label showing the number of articles represented in an item."
            values={{
              count: articlesCount,
            }}
          />
        }
      />
    );
  // Display no fact-check label for shared feed clusters that have no fact-checks (when feed sharing fact-checks)
  } else if (inSharedFeed && feedContainsFactChecks && !factCheckCount) {
    return (
      <div className={styles.cardTag}>
        <ButtonMain size="small" variant="text" disabled label={<FormattedMessage id="itemArticlesOrFactCheck.noFactCheck" defaultMessage="no fact-check" description="A label that appears when no fact-check is present to display." />} />
      </div>
    );
  // Display no articles label for workspace clusters that have no articles at all, regardless of type
  } else if (!inSharedFeed && !articlesCount && !factCheckCount) {
    return (
      <div className={styles.cardTag}>
        <ButtonMain size="small" variant="text" disabled label={<FormattedMessage id="itemArticlesOrFactCheck.noArticles" defaultMessage="no articles" description="A label that appears when no articles are present to display." />} />
      </div>
    );
  }
  return null;
};

export default ItemArticlesOrFactCheck;
