import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql } from 'react-relay/compat';
import MediaSimilaritiesComponent from './MediaSimilaritiesComponent';

const MediaSimilarities = ({ projectMedia }) => {
  const ids = `${projectMedia.dbid},0,${projectMedia.team.dbid}`; // Project ID doesn't matter

  return (
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query MediaSimilaritiesQuery($ids: String!) {
          project_media(ids: $ids) {
            id
            ...MediaSimilaritiesComponent_projectMedia
          }
        }
      `}
      variables={{
        ids,
      }}
      render={({ props }) => {
        if (props) {
          return (<MediaSimilaritiesComponent projectMedia={props.project_media} />);
        }
        return null;
      }}
    />
  );
};

MediaSimilarities.propTypes = {
  projectMedia: PropTypes.shape({
    dbid: PropTypes.number.isRequired,
    team: PropTypes.shape({
      dbid: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
};

export default MediaSimilarities;
