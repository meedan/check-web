import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';

const SmoochBotPreviewFeed = ({
  feedUrl,
  count,
  refetch,
  installationId,
  onError,
  onSuccess,
}) => {
  if (!feedUrl) {
    onSuccess('');
    return null;
  }
  if (feedUrl && count && refetch) {
    return (
      <QueryRenderer
        environment={Relay.Store}
        query={graphql`
          query SmoochBotPreviewFeedQuery($installationId: ID!, $feedUrl: String!, $count: Int!) {
            node(id: $installationId) {
              ... on TeamBotInstallation {
                smooch_bot_preview_rss_feed(rss_feed_url: $feedUrl, number_of_articles: $count)
              }
            }
          }
        `}
        variables={{
          installationId,
          feedUrl,
          count,
          refetch,
        }}
        render={({ error, props }) => {
          if (error) {
            onError();
          } else if (props) {
            onSuccess(props.node.smooch_bot_preview_rss_feed);
          }
          return null;
        }}
      />
    );
  }
  return null;
};

SmoochBotPreviewFeed.propTypes = {
  installationId: PropTypes.string.isRequired,
  feedUrl: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  refetch: PropTypes.number.isRequired, // Increment to force a refetch
  onError: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default SmoochBotPreviewFeed;
