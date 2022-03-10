import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql } from 'react-relay/compat';
import MediaSuggestionsComponent from './MediaSuggestionsComponent';
import MediaSimilaritiesComponent from './MediaSimilaritiesComponent'; // eslint-disable-line no-unused-vars
import MediasLoading from '../MediasLoading';

const MediaSuggestions = ({ projectMedia }) => {
  const ids = `${projectMedia.dbid},0,${projectMedia.team.dbid}`; // Project ID doesn't matter

  return (
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query MediaSuggestionsQuery($ids: String!) {
          project_media(ids: $ids) {
            ...MediaSimilaritiesComponent_projectMedia
            id
            dbid
            report_type
            confirmedSimilarCount: confirmed_similar_items_count
            demand
            suggested_similar_relationships(first: 10000) {
              edges {
                node {
                  id
                  target_id
                  target {
                    id
                    dbid
                    project_id
                  }
                }
              }
            }
            team {
              smooch_bot: team_bot_installation(bot_identifier: "smooch") {
                id
              }
              permissions
            }
          }
        }
      `}
      variables={{
        ids,
      }}
      render={({ props }) => {
        if (props) {
          return (
            <MediaSuggestionsComponent
              mainItem={props.project_media}
              key={props.project_media.confirmedSimilarCount}
              team={props.project_media.team}
              relationships={props.project_media.suggested_similar_relationships.edges
                .map(r => r.node)}
            />
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
