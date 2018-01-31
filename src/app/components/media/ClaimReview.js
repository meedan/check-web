import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';

const ClaimReview = (props) => {
  const { data } = props;
  const reviewer = (
    <a href={data.author.url} target="_blank" rel="noopener noreferrer">
      {data.author.name || (new URL(data.author.url)).hostname}
    </a>
  );
  const rating = data.reviewRating.alternateName ||
    `${data.reviewRating.ratingValue} (${data.reviewRating.worstRating} - ${data.reviewRating.bestRating})`;
  return (
    <div>
      <h3>
        <FormattedMessage
          id="claimReview.title"
          defaultMessage="Claim Review"
        />
      </h3>
      <ul>
        <li>
          <FormattedMessage id="claimReview.claim" defaultMessage="Claim" />
          : {data.claimReviewed}
        </li>
        <li>
          <FormattedMessage id="claimReview.claimedBy" defaultMessage="Claimed by" />
          : {data.itemReviewed.author.name}
        </li>
        <li>
          <FormattedMessage
            id="claimReview.reviewedBy"
            defaultMessage="Fact-checked by {reviewer}"
            values={{ reviewer }}
          />
          : {rating}
        </li>
      </ul>
    </div>
  );
};

export default injectIntl(ClaimReview);
