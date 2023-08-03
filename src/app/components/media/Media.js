import React from 'react';
import PropTypes from 'prop-types';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { injectIntl } from 'react-intl';
import MediaComponent from './MediaComponent';
import MediasLoading from './MediasLoading';
import ErrorBoundary from '../error/ErrorBoundary';
import CheckContext from '../../CheckContext';

const ProjectMedia = (parentProps, context) => {
  let { projectId } = parentProps;
  const { projectMediaId, view } = parentProps;
  const checkContext = new CheckContext({ props: parentProps, context });
  checkContext.setContext();
  if (!projectId) {
    const store = checkContext.getContextStore();
    if (store.project) {
      projectId = store.project.dbid;
    }
  }

  return (
    <ErrorBoundary component="Media">
      <QueryRenderer
        environment={Relay.Store}
        query={graphql`
          query MediaQuery($ids: String!) {
            project_media(ids: $ids) {
              ...MediaComponent_projectMedia
            }
          }
        `}
        variables={{
          ids: `${projectMediaId},,`,
        }}
        render={({ error, props }) => {
          if (!error && !props) {
            return (<MediasLoading theme="grey" variant="page" size="large" />);
          }

          if (!error && props) {
            return (
              <MediaComponent
                projectMedia={props.project_media}
                view={view}
              />
            );
          }

          // TODO: We need a better error handling in the future, standardized with other components
          return null;
        }}
      />
    </ErrorBoundary>
  );
};

ProjectMedia.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(ProjectMedia);
