import React from 'react';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { QueryRenderer, graphql } from 'react-relay/compat';
import ErrorBoundary from '../error/ErrorBoundary';
import MediasLoading from '../media/MediasLoading';
import NotFound from '../NotFound';
import FeedMediaRequests from './FeedMediaRequests';
import MediaCardLarge from '../media/MediaCardLarge';

const FeedItemMediaDialog = ({ itemDbid, feedDbid }) => {
  const urlParseRegex = new RegExp('^/(?<currentTeamSlug>[^/]+)/');
  const { currentTeamSlug } = urlParseRegex.test(window.location.pathname) && window.location.pathname.match(urlParseRegex).groups;

  return (
    <ErrorBoundary component="FeedItemMediaDialog">
      <QueryRenderer
        environment={Relay.Store}
        query={graphql`
          query FeedItemMediaDialogQuery($currentTeamSlug: String!, $feedDbid: Int!, $projectMediaDbid: Int!, $itemDbid: Int!) {
            team(slug: $currentTeamSlug) {
              feed(dbid: $feedDbid) {
                cluster(project_media_id: $projectMediaDbid) {
                  project_media(id: $itemDbid) {
                    ...FeedMediaRequests_projectMedia
                    ...MediaCardLarge_projectMedia
                  }
                }
              }
            }
          }
        `}
        variables={{
          currentTeamSlug,
          feedDbid: parseInt(feedDbid, 10),
          projectMediaDbid: parseInt(itemDbid, 10),
          itemDbid: parseInt(itemDbid, 10),
        }}
        render={({ props, error }) => {
          if (props && !error) {
            const projectMedia = props.team?.feed?.cluster?.project_media;
            if (projectMedia) {
              return (
                <>
                  <div>
                    <MediaCardLarge inModal projectMedia={projectMedia} />
                  </div>
                  <div>
                    <FeedMediaRequests projectMedia={projectMedia} />
                  </div>
                </>
              );
            }
            return (<NotFound />);
          }
          return <MediasLoading theme="grey" variant="inline" size="large" />;
        }}
      />
    </ErrorBoundary>
  );
};

FeedItemMediaDialog.propTypes = {
  itemDbid: PropTypes.number.isRequired,
  feedDbid: PropTypes.number.isRequired,
};

export default FeedItemMediaDialog;
