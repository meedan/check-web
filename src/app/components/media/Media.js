import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import CheckContext from '../../CheckContext';
import MediaRoute from '../../relay/MediaRoute';
import MediaComponent from './MediaComponent';
import MediasLoading from './MediasLoading';
import mediaFragment from '../../relay/mediaFragment';

const MediaContainer = Relay.createContainer(MediaComponent, {
  initialVariables: {
    contextId: null,
  },
  fragments: {
    media: () => mediaFragment,
  },
});

class ProjectMedia extends Component {
  render() {
    let projectId = this.props.params.projectId || 0;
    if (projectId === 0) {
      const context = new CheckContext(this);
      context.setContext();
      const store = context.getContextStore();
      if (store.project) {
        projectId = store.project.dbid;
      }
    }
    const ids = `${this.props.params.mediaId},${projectId}`;
    const route = new MediaRoute({ ids });

    return (
      <Relay.RootContainer
        Component={MediaContainer}
        route={route}
        renderLoading={function () {
          return <MediasLoading count={1} />;
        }}
      />
    );
  }
}

ProjectMedia.contextTypes = {
  store: React.PropTypes.object,
};

export default ProjectMedia;
