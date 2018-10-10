import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import {
  units,
} from '../../styles/js/shared';

const ReviewContainer = styled.div`
  padding-bottom: ${units(2)};
`;

const ReviewLabel = styled.span`
  color: #666;
`;

const ClaimReview = (props) => {
  const { data } = props;

  // Bail early with bad data.
  if (
    !data.author ||
    !data.reviewRating || (!data.reviewRating.alternateName && !data.reviewRating.ratingValue) ||
    !data.claimReviewed ||
    !data.itemReviewed || !data.itemReviewed.author
  ) {
    return null;
  }

  const reviewer = data.author.url ?
    (
      <a href={data.author.url} target="_blank" rel="noopener noreferrer">
        {data.author.name || (new URL(data.author.url)).hostname}
      </a>
    ) :
    data.author.name;
  const rating = data.reviewRating.alternateName ||
    `${data.reviewRating.ratingValue} (${data.reviewRating.worstRating}-${data.reviewRating.bestRating})`;
  return (
    <ReviewContainer>
      <ul>
        <li>
          <ReviewLabel>
            <FormattedMessage id="claimReview.claim" defaultMessage="Claim: " />
          </ReviewLabel>
          {data.claimReviewed}
        </li>
        <li>
          <ReviewLabel>
            <FormattedMessage id="claimReview.claimedBy" defaultMessage="Claimed by: " />
          </ReviewLabel>
          {data.itemReviewed.author.name}
        </li>
        <li>
          <ReviewLabel>
            <FormattedMessage
              id="claimReview.reviewedBy"
              defaultMessage="Fact-checked by {reviewer}: "
              values={{ reviewer }}
            />
          </ReviewLabel>
          {rating}
        </li>
      </ul>
    </ReviewContainer>
  );
};

export default injectIntl(ClaimReview);
