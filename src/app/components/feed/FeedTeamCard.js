import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedHTMLMessage } from 'react-intl';
import cx from 'classnames/bind';
import Card from '../cds/media-cards/Card';
import SharedItemCardFooter from '../search/SearchResultsCards/SharedItemCardFooter';
import FeedTeamFactCheckCard from './FeedTeamFactCheckCard';
import CheckFeedDataPoints from '../../CheckFeedDataPoints';
import TeamAvatar from '../team/TeamAvatar';
import styles from './FeedItem.module.css';

const FeedTeamCard = ({
  feed,
  team,
  clusterTeam,
  selected,
  onClick,
}) => {
  const factChecks = clusterTeam.fact_checks || { edges: [] };
  const isSharingFactChecks = (feed.data_points?.includes(CheckFeedDataPoints.PUBLISHED_FACT_CHECKS));
  const expanded = (isSharingFactChecks && selected);

  const handleClick = () => {
    if (selected) {
      onClick(null);
    } else {
      onClick(team.dbid);
    }
  };

  let uncategorizedMediaCount = clusterTeam.media_count;
  let uncategorizedRequestsCount = clusterTeam.requests_count;

  return (
    <div // eslint-disable-line jsx-a11y/click-events-have-key-events
      className={cx(
        expanded ? styles.feedItemTeamCardExpanded : styles.feedItemTeamCardCollapsed,
        selected ? styles.feedItemTeamCardSelected : styles.feedItemTeamCardNotSelected,
      )}
      onClick={handleClick}
    >
      <Card className={styles.feedItemTeamCard}>
        <TeamAvatar team={{ avatar: team.avatar }} size="54px" />
        <div>
          <div>
            <h6 className="typography-button">{team.name}</h6>
          </div>
          <div>
            <SharedItemCardFooter
              buttonProps={{
                variant: 'text',
                theme: 'text',
              }}
              mediaCount={clusterTeam.media_count}
              requestsCount={clusterTeam.requests_count}
              lastRequestDate={clusterTeam.last_request_date && new Date(parseInt(clusterTeam.last_request_date, 10) * 1000)}
            />
          </div>
        </div>
        { Object.keys(clusterTeam).length === 0 ? // Empty clusterTeam object (e.g., {})
          <div className={styles.feedItemTeamCardNotSharing}>
            <FormattedHTMLMessage
              id="feedTeamCard.notContributing"
              defaultMessage="Your workspace does not contribute to this shared feed item.<br />Select a workspace below to import it’s media to your workspace."
              description="Displayed on the current workspace card on feed item page when the current workspace is not contributing to that cluster. This is an HTML message, please keep the <br /> tag."
            />
          </div>
          : null
        }
        { expanded ?
          <>
            { factChecks.edges.map(edge => edge.node).map((clusterTeamFactCheck) => {
              uncategorizedMediaCount -= parseInt(clusterTeamFactCheck.media_count, 10);
              uncategorizedRequestsCount -= parseInt(clusterTeamFactCheck.requests_count, 10);
              return (<FeedTeamFactCheckCard clusterTeamFactCheck={clusterTeamFactCheck} />);
            })}
            { (uncategorizedMediaCount > 0 || uncategorizedRequestsCount > 0) ?
              <FeedTeamFactCheckCard
                clusterTeamFactCheck={{
                  media_count: (uncategorizedMediaCount > 0 ? uncategorizedMediaCount : null),
                  requests_count: (uncategorizedRequestsCount > 0 ? uncategorizedRequestsCount : null),
                }}
              />
              : null
            }
          </>
          : null
        }
      </Card>
    </div>
  );
};

FeedTeamCard.defaultProps = {
  clusterTeam: {},
  selected: false,
  onClick: () => {},
};

FeedTeamCard.propTypes = {
  team: PropTypes.shape({
    name: PropTypes.string.isRequired,
    dbid: PropTypes.number.isRequired,
    avatar: PropTypes.string.isRequired,
  }).isRequired,
  feed: PropTypes.shape({
    data_points: PropTypes.arrayOf(PropTypes.number).isRequired,
  }).isRequired,
  clusterTeam: PropTypes.shape({
    media_count: PropTypes.number,
    requests_count: PropTypes.number,
    last_request_date: PropTypes.number,
    fact_checks: PropTypes.exact({
      edges: PropTypes.arrayOf(PropTypes.shape({
        node: PropTypes.object,
      })),
    }),
  }),
  selected: PropTypes.bool,
  onClick: PropTypes.func,
};

export default createFragmentContainer(FeedTeamCard, graphql`
  fragment FeedTeamCard_team on Node {
    ... on Team {
      name
      dbid
      avatar
    }
    ... on PublicTeam {
      name
      dbid
      avatar
    }
  }
  fragment FeedTeamCard_feed on Feed {
    data_points
  }
  fragment FeedTeamCard_clusterTeam on ClusterTeam {
    media_count
    requests_count
    last_request_date
    fact_checks(first: 100) {
      edges {
        node {
          media_count
          requests_count
          ...FeedTeamFactCheckCard_clusterTeamFactCheck
        }
      }
    }
  }
`);
