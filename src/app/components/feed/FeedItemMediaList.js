import React from 'react';
import PropTypes from 'prop-types';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import ErrorBoundary from '../error/ErrorBoundary';
import MediasLoading from '../media/MediasLoading';
import MediaSlug from '../media/MediaSlug';
import SmallMediaCard from '../cds/media-cards/SmallMediaCard';
import MediaAndRequestsDialogComponent from '../cds/menus-lists-dialogs/MediaAndRequestsDialogComponent';
import NotFound from '../NotFound';

const FeedItemMediaListComponent = ({ items, feedDbid, intl }) => {
  const [selectedItemId, setSelectedItemId] = React.useState(null);

  const swallowClick = (event) => {
    event.stopPropagation();
  };

  return (
    <div id="feed-item-page-media-list">
      {items.map((item) => {
        const details = [
          (
            item.last_seen &&
              <FormattedMessage
                id="feedItemMediaList.lastSubmitted"
                defaultMessage="Last submitted {date}"
                description="Shows the last time a media was submitted (on feed item page media card)"
                values={{
                  date: intl.formatDate(item.last_seen * 1000, { year: 'numeric', month: 'short', day: '2-digit' }),
                }}
              />
          ),
          (
            item.requests_count &&
              <FormattedMessage
                id="feedItemMediaList.requestsCount"
                defaultMessage="{requestsCount, plural, one {# request} other {# requests}}"
                description="Header of requests list. Example: 26 requests."
                values={{ requestsCount: item.requests_count }}
              />
          ),
        ];

        return (
          <>
            <SmallMediaCard
              key={item.dbid}
              customTitle={item.title}
              details={details}
              media={item.media}
              description={item.description}
              onClick={() => setSelectedItemId(item.dbid)}
            />
            { selectedItemId === item.dbid ?
              <MediaAndRequestsDialogComponent
                mediaSlug={
                  <MediaSlug
                    mediaType={item.type}
                    slug={item.title}
                    details={details}
                  />
                }
                projectMediaImportedId={selectedItemId}
                feedId={feedDbid}
                onClick={swallowClick}
                onClose={() => setSelectedItemId(null)}
              />
              : null
            }
          </>
        );
      })}
    </div>
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
        variables={{
          currentTeamSlug,
          feedDbid: parseInt(feedDbid, 10),
          projectMediaDbid: parseInt(projectMediaDbid, 10),
          itemTeamDbid: parseInt(teamDbid, 10),
        }}
        render={({ props, error }) => {
          if (props && !error) {
            const items = props.team?.feed?.cluster?.project_medias;
            if (items) {
              return (<FeedItemMediaListComponentWithIntl feedDbid={parseInt(feedDbid, 10)} items={items.edges.map(edge => edge.node)} />);
            }
            return (<NotFound />);
          }
          return <MediasLoading theme="grey" variant="inline" size="large" />;
        }}
      />
    </ErrorBoundary>
  );
};

FeedItemMediaList.propTypes = {
  teamDbid: PropTypes.number.isRequired,
};

export default FeedItemMediaList;
