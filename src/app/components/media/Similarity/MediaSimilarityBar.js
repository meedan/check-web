/* eslint-disable relay/unused-fields */
import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql } from 'react-relay/compat';
import MediaSimilarityBarComponent from './MediaSimilarityBarComponent';
import { can } from '../../Can';

const MediaSimilarityBar = ({ projectMedia, setShowTab }) => {
  const ids = `${projectMedia.dbid},0,${projectMedia.team.dbid}`; // Project ID doesn't matter

  return (
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query MediaSimilarityBarQuery($ids: String!) {
          project_media(ids: $ids) {
            id
            dbid
            type
            permissions
            report_status
            hasMain: is_confirmed_similar_to_another_item
            isSuggested: is_suggested
            confirmedMainItem: confirmed_main_item {
              id
              dbid
              team {
                slug
              }
            }
            suggestedMainItem: suggested_main_item {
              id
              dbid
              team {
                slug
              }
            }
            suggestionsCount: suggested_similar_items_count
            confirmedSimilarCount: confirmed_similar_items_count
          }
        }
      `}
      variables={{
        ids,
      }}
      render={({ props }) => {
        if (props) {
          return (
            <MediaSimilarityBarComponent
              projectMediaDbid={props.project_media.dbid}
              suggestionsCount={props.project_media.suggestionsCount}
              confirmedSimilarCount={props.project_media.confirmedSimilarCount}
              hasMain={props.project_media.hasMain}
              isSuggested={props.project_media.isSuggested}
              confirmedMainItem={props.project_media.confirmedMainItem}
              canAdd={can(props.project_media.permissions, 'update ProjectMedia')}
              isBlank={props.project_media.type === 'Blank'}
              isPublished={props.project_media.report_status === 'published'}
              setShowTab={setShowTab}
            />
          );
        }
        return null;
      }}
    />
  );
};

MediaSimilarityBar.propTypes = {
  projectMedia: PropTypes.shape({
    dbid: PropTypes.number.isRequired,
    team: PropTypes.shape({
      dbid: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
  setShowTab: PropTypes.func.isRequired, // React useState setter
};

export default MediaSimilarityBar;
