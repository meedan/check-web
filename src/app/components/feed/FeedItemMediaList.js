/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import ErrorBoundary from '../error/ErrorBoundary';
import Loader from '../cds/loading/Loader';
import MediaSlug from '../media/MediaSlug';
import SmallMediaCard from '../cds/media-cards/SmallMediaCard';
import MediaAndRequestsDialogComponent from '../cds/menus-lists-dialogs/MediaAndRequestsDialogComponent';
import NotFound from '../NotFound';
import styles from '../media/media.module.css';

const FeedItemMediaListComponent = ({ feedDbid, intl, items }) => {
  const [selectedItemId, setSelectedItemId] = React.useState(null);

  const swallowClick = (event) => {
    event.stopPropagation();
  };

  return (
    <>
      {items.map((item) => {
        const details = [
          (
            item.last_seen &&
              <FormattedMessage
                defaultMessage="Last submitted {date}"
                description="Shows the last time a media was submitted (on feed item page media card)"
                id="feedItemMediaList.lastSubmitted"
                values={{
                  date: intl.formatDate(item.last_seen * 1000, { year: 'numeric', month: 'short', day: '2-digit' }),
                }}
              />
          ),
          (
            item.requests_count &&
              <FormattedMessage
                defaultMessage="{requestsCount, plural, one {# request} other {# requests}}"
                description="Header of requests list. Example: 26 requests."
                id="feedItemMediaList.requestsCount"
                values={{ requestsCount: item.requests_count }}
              />
          ),
        ];

        return (
          <>
            <SmallMediaCard
              customTitle={item.title}
              description={item.description}
              details={details}
              key={item.dbid}
              media={item.media}
              onClick={() => setSelectedItemId(item.dbid)}
            />
            { selectedItemId === item.dbid ?
              <MediaAndRequestsDialogComponent
                feedId={feedDbid}
                mediaSlug={
                  <MediaSlug
                    className={styles['media-slug-title']}
                    details={details}
                    mediaType={item.type}
                    slug={item.title}
                  />
                }
                projectMediaImportedId={selectedItemId}
                onClick={swallowClick}
                onClose={() => setSelectedItemId(null)}
              />
              : null
            }
          </>
        );
      })}
    </>
  );
};

FeedItemMediaListComponent.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    dbid: PropTypes.number.isRequired,
    title: PropTypes.string,
    last_seen: PropTypes.string,
    requests_count: PropTypes.number,
    description: PropTypes.string,
    media: PropTypes.object,
    type: PropTypes.string,
  })).isRequired,
  feedDbid: PropTypes.number.isRequired,
  intl: intlShape.isRequired,
};

const FeedItemMediaListComponentWithIntl = injectIntl(FeedItemMediaListComponent);

const FeedItemMediaList = ({ teamDbid }) => {
  const urlParseRegex = new RegExp('^/(?<currentTeamSlug>[^/]+)/feed/(?<feedDbid>[0-9]+)/item/(?<projectMediaDbid>[0-9]+)$');
  const { currentTeamSlug, feedDbid, projectMediaDbid } = urlParseRegex.test(window.location.pathname) && window.location.pathname.match(urlParseRegex).groups;

  return (
    <ErrorBoundary component="FeedItemMediaList">
      <QueryRenderer
        environment={Relay.Store}
        query={graphql`
          query FeedItemMediaListQuery($currentTeamSlug: String!, $feedDbid: Int!, $projectMediaDbid: Int!, $itemTeamDbid: Int!) {
            team(slug: $currentTeamSlug) {
              feed(dbid: $feedDbid) {
                cluster(project_media_id: $projectMediaDbid) {
                  project_medias(first: 100, teamId: $itemTeamDbid) {
                    edges {
                      node {
                        dbid
                        title
                        last_seen
                        requests_count
                        description
                        type
                        media {
                          ...SmallMediaCard_media
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `}
        render={({ error, props }) => {
          if (props && !error) {
            const items = props.team?.feed?.cluster?.project_medias;
            if (items) {
              return (<FeedItemMediaListComponentWithIntl feedDbid={parseInt(feedDbid, 10)} items={items.edges.map(edge => edge.node)} />);
            }
            return (<NotFound />);
          }
          return <Loader size="large" theme="grey" variant="inline" />;
        }}
        variables={{
          currentTeamSlug,
          feedDbid: parseInt(feedDbid, 10),
          projectMediaDbid: parseInt(projectMediaDbid, 10),
          itemTeamDbid: parseInt(teamDbid, 10),
        }}
      />
    </ErrorBoundary>
  );
};

FeedItemMediaList.propTypes = {
  teamDbid: PropTypes.number.isRequired,
};

export default FeedItemMediaList;
