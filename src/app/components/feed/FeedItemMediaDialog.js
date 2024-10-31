/* eslint-disable react/sort-prop-types */
import React from 'react';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { QueryRenderer, graphql } from 'react-relay/compat';
import FeedMediaRequests from './FeedMediaRequests';
import ErrorBoundary from '../error/ErrorBoundary';
import Loader from '../cds/loading/Loader';
import NotFound from '../NotFound';
import MediaCardLarge from '../media/MediaCardLarge';

const FeedItemMediaDialog = ({ feedDbid, itemDbid }) => {
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
        render={({ error, props }) => {
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
          return <Loader size="large" theme="grey" variant="inline" />;
        }}
        variables={{
          currentTeamSlug,
          feedDbid: parseInt(feedDbid, 10),
          projectMediaDbid: parseInt(itemDbid, 10),
          itemDbid: parseInt(itemDbid, 10),
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
