import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames/bind';
import SharedItemCardFooter from '../search/SearchResultsCards/SharedItemCardFooter';
import FeedTeamFactCheckDialog from './FeedTeamFactCheckDialog';
import styles from './FeedItem.module.css';

const FeedTeamFactCheckCard = ({ clusterTeamFactCheck }) => {
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const hasFactCheck = (clusterTeamFactCheck.fact_check_title || clusterTeamFactCheck.fact_check_summary);

  const handleMore = (e) => {
    setDialogOpen(true);
    e.stopPropagation();
  };

  const handleCloseDialog = (e) => {
    setDialogOpen(false);
    e.stopPropagation();
  };

  return (
    <div className={styles.feedTeamFactCheckCard}>

      {/* There is a fact-check */}
      { hasFactCheck ?
        <div>
          <h6 className="typography-button">
            <FormattedMessage id="feedTeamFactCheckCard.factCheck" defaultMessage="Fact-check:" description="Label for fact-check card on feed item page" />
            {clusterTeamFactCheck.rating}
          </h6>
          <div className={cx('typography-body2', styles.feedItemOneLineText)}>{clusterTeamFactCheck.fact_check_title || clusterTeamFactCheck.fact_check_summary}</div>
        </div>
        : null
      }

      {/* There is a claim, but no fact-check */}
      { !hasFactCheck && clusterTeamFactCheck.claim ?
        <div>
          <h6 className="typography-button"><FormattedMessage id="feedTeamFactCheckCard.claim" defaultMessage="Claim:" description="Label for claim card on feed item page" /></h6>
          <div className="typography-body2">{clusterTeamFactCheck.claim}</div>
        </div>
        : null
      }

      {/* No claim and no fact-check - "uncategorized media" */}
      { !hasFactCheck && !clusterTeamFactCheck.claim ?
        <div>
          <h6 className="typography-button"><FormattedMessage id="feedTeamFactCheckCard.uncategorizedMedia" defaultMessage="Uncategorized Media" description="Label for uncategorized media card on feed item page" /></h6>
        </div>
        : null
      }

      <SharedItemCardFooter
        buttonProps={{
          variant: 'text',
          theme: 'text',
        }}
        mediaCount={clusterTeamFactCheck.media_count}
        requestsCount={clusterTeamFactCheck.requests_count}
        onSeeMore={(hasFactCheck || clusterTeamFactCheck.claim) ? handleMore : null}
      />

      { dialogOpen ?
        <FeedTeamFactCheckDialog rating={clusterTeamFactCheck.rating} claimDescription={clusterTeamFactCheck.claim_description} onClose={handleCloseDialog} />
        : null
      }
    </div>
  );
};

FeedTeamFactCheckCard.propTypes = {
  clusterTeamFactCheck: PropTypes.shape({
    claim: PropTypes.string,
    rating: PropTypes.string,
    fact_check_title: PropTypes.string,
    fact_check_summary: PropTypes.string,
    media_count: PropTypes.number,
    requests_count: PropTypes.number,
    claim_description: PropTypes.object,
  }).isRequired,
};

export default createFragmentContainer(FeedTeamFactCheckCard, graphql`
  fragment FeedTeamFactCheckCard_clusterTeamFactCheck on ClusterTeamFactCheck {
    claim
    rating
    fact_check_title
    fact_check_summary
    media_count
    requests_count
    claim_description {
      ...FeedTeamFactCheckDialog_claimDescription
    }
  }
`);
