import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql } from 'react-relay/compat';
import MediaRelatedComponent from './MediaRelatedComponent';
import MediasLoading from '../MediasLoading';

const MediaRelated = ({ projectMedia }) => {
  const ids = `${projectMedia.dbid},0,${projectMedia.team.dbid}`; // Project ID doesn't matter

  return (
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query MediaRelatedQuery($ids: String!) {
          project_media(ids: $ids) {
            id
            ...MediaRelatedComponent_projectMedia
          }
        }
      `}
      variables={{
        ids,
      }}
      render={({ props }) => {
        if (props) {
          return (<MediaRelatedComponent projectMedia={props.project_media} />);
        }
        return <MediasLoading count={1} />;
      }}
    />
  );
};

MediaRelated.propTypes = {
  projectMedia: PropTypes.shape({
    dbid: PropTypes.number.isRequired,
    team: PropTypes.shape({
      dbid: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
};

export default MediaRelated;
