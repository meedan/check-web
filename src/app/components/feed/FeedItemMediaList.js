/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { injectIntl } from 'react-intl';
import ErrorBoundary from '../error/ErrorBoundary';
import Loader from '../cds/loading/Loader';
import MediaSlug from '../media/MediaSlug';
import SmallMediaCard from '../cds/media-cards/SmallMediaCard';
import MediaAndRequestsDialogComponent from '../cds/menus-lists-dialogs/MediaAndRequestsDialogComponent';
import NotFound from '../NotFound';
import LastRequestDate from '../cds/media-cards/LastRequestDate';
import RequestsCount from '../cds/media-cards/RequestsCount';
import styles from '../media/media.module.css';

const FeedItemMediaListComponent = ({ feedDbid, items }) => {
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
              <LastRequestDate
                lastRequestDate={item.last_seen * 1000}
                theme="lightText"
                variant="text"
              />
          ),
          (
            item.requests_count &&
              <RequestsCount
                requestsCount={item.requests_count}
                theme="lightText"
                variant="text"
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
