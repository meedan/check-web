/* eslint-disable relay/unused-fields */
import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql } from 'react-relay/compat';
import MediaSimilaritiesComponent from './MediaSimilaritiesComponent'; // eslint-disable-line no-unused-vars
import PaginatedMediaSuggestions from './PaginatedMediaSuggestions';
import Loader from '../../cds/loading/Loader';

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
        check_search_trash { id, number_of_results }
        check_search_spam { id, number_of_results }
        public_team { id, trash_count, spam_count }
        slug
        smooch_bot: team_bot_installation(bot_identifier: "smooch") {
          id
        }
        permissions
        search_id
        medias_count
        id
      }
    }
  }
`;

const MediaSuggestions = ({ dbid }) => {
  const ids = `${dbid}`;
  const pageSize = 4;

  return (
    <QueryRenderer
      environment={Relay.Store}
      query={mediaSuggestionsQuery}
      render={({ props }) => {
        if (props) {
          return (
            <PaginatedMediaSuggestions pageSize={pageSize} parentProps={props} root={props.project_media} />
          );
        }
        return <Loader size="medium" theme="grey" variant="inline" />;
      }}
      variables={{
        ids,
        pageSize,
      }}
    />
  );
};

MediaSuggestions.propTypes = {
  dbid: PropTypes.number.isRequired,
};

export default MediaSuggestions;
