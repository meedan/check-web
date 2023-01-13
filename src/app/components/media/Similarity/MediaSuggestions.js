/* eslint-disable relay/unused-fields */
import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql } from 'react-relay/compat';
import MediaSimilaritiesComponent from './MediaSimilaritiesComponent'; // eslint-disable-line no-unused-vars
import MediaItem from './MediaItem'; // eslint-disable-line no-unused-vars
import PaginatedMediaSuggestions from './PaginatedMediaSuggestions';
import MediasLoading from '../MediasLoading';

// Initial query for the paginated media suggestions
const mediaSuggestionsQuery = graphql`
  query MediaSuggestionsQuery($ids: String!, $pageSize: Int!, $after: String) {
    project_media(ids: $ids) {
      ...MediaSimilaritiesComponent_projectMedia
      id
      dbid
      report_type
      confirmedSimilarCount: confirmed_similar_items_count
      demand
      ...PaginatedMediaSuggestions_root
      team {
        slug
        smooch_bot: team_bot_installation(bot_identifier: "smooch") {
          id
        }
        permissions
      }
    }
  }
`;

const MediaSuggestions = ({ dbid, teamDbid }) => {
  const ids = `${dbid},0,${teamDbid}`; // Project ID doesn't matter
  const pageSize = 4;

  return (
    <QueryRenderer
      environment={Relay.Store}
      query={mediaSuggestionsQuery}
      variables={{
        ids,
        pageSize,
      }}
      render={({ props }) => {
        if (props) {
          return (
            <PaginatedMediaSuggestions root={props.project_media} parentProps={props} pageSize={pageSize} />
          );
        }
        return <MediasLoading count={1} />;
      }}
    />
  );
};

MediaSuggestions.propTypes = {
  projectMedia: PropTypes.shape({
    dbid: PropTypes.number.isRequired,
    team: PropTypes.shape({
      dbid: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
};

export default MediaSuggestions;
