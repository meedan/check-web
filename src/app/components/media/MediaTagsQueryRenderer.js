import React from 'react';
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql } from 'react-relay/compat';
import MediaTags from './MediaTags';

const pageSize = 100;

const MediaTagsQueryRenderer = parentProps => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query MediaTagsQueryRendererQuery($ids: String!, $pageSize: Int!, $keyword: String!) {
        project_media(ids: $ids) {
          ...MediaTags_projectMedia @arguments(pageSize: $pageSize, keyword: $keyword)
        }
      }
    `}
    render={({ error, props }) => {
      if (error) return null;

      return (
        <MediaTags projectMedia={props?.project_media} />
      );
    }}
    variables={{
      ids: `${parentProps.projectMediaId},,`,
      pageSize,
      keyword: '',
    }}
  />
);

export default MediaTagsQueryRenderer;
