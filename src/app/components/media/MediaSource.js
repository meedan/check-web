/* eslint-disable relay/unused-fields */
import React from 'react';
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql, commitMutation } from 'react-relay/compat';
import cx from 'classnames/bind';
import ChangeMediaSource from './ChangeMediaSource';
import CreateMediaSource from './CreateMediaSource';
import Loader from '../cds/loading/Loader';
import ErrorBoundary from '../error/ErrorBoundary';
import SourceInfo from '../source/SourceInfo';
import { can } from '../Can';
import styles from './media.module.css';

let sourceTabFrameTimer = null;
let sourceTabFrameHeight = 0;
function updateHeight() {
  const height = document.documentElement.scrollHeight;
  if (height !== sourceTabFrameHeight) {
    window.parent.postMessage(JSON.stringify({ height }), '*');
    sourceTabFrameHeight = height;
  }
  sourceTabFrameTimer = setTimeout(updateHeight, 500);
}

const MediaSourceComponent = ({ about, projectMedia }) => {
  const [action, setAction] = React.useState('view');
  const [newSourceName, setNewSourceName] = React.useState('');

  React.useEffect(() => {
    // This code only applies if this page is embedded in the browser extension
    if (window.parent !== window) {
      sourceTabFrameTimer = setTimeout(updateHeight, 500);
    }

    return () => {
      if (sourceTabFrameTimer) {
        clearTimeout(sourceTabFrameTimer);
      }
    };
  }, []);

  const handleChangeSourceSubmit = (value) => {
    if (value) {
      const onFailure = () => {}; // FIXME: Add error handling
      const onSuccess = () => { setAction('view'); };

      commitMutation(Relay.Store, {
        mutation: graphql`
          mutation MediaSourceChangeSourceMutation($input: UpdateProjectMediaInput!, $teamSlug: String!) {
            updateProjectMedia(input: $input) {
              project_media {
                id
                source {
                  id
                  dbid
                  image
                  name
                  pusher_channel
                  medias_count
                  permissions
                  updated_at
                  archived
                  account_sources(first: 10000) {
                    edges {
                      node {
                        id
                        permissions
                        account {
                          id
                          url
                        }
                      }
                    }
                  }
                  ...SourceInfo_source @arguments(teamSlug: $teamSlug)
                }
              }
            }
          }
        `,
        variables: {
          input: {
            id: projectMedia.id,
            source_id: value.dbid,
          },
          teamSlug: projectMedia.team.slug,
        },
        onError: onFailure,
        onCompleted: ({ data, errors }) => {
          if (errors) {
            return onFailure(errors);
          }
          return onSuccess(data);
        },
      });
    }
  };

  const handleCancel = () => setAction('view');
  const handleCreateNewSource = (name) => {
    setNewSourceName(name);
    setAction('create');
  };
  const handleChangeSource = () => setAction('change');

  const { source, team } = projectMedia;

  return (
    <React.Fragment>
      <div className={cx(styles['media-sources'], styles['media-item-content'])} id="media__source">
        { action === 'view' && source !== null ?
          <SourceInfo
            about={about}
            key={source ? source.id : 0}
            projectMediaPermissions={projectMedia.permissions}
            relateToExistingSource={handleChangeSourceSubmit}
            source={source}
            team={team}
            onChangeClick={handleChangeSource}
          /> : null
        }
        { action === 'create' && can(projectMedia.permissions, 'create Source') ?
          <CreateMediaSource
            media={projectMedia}
            name={newSourceName}
            relateToExistingSource={handleChangeSourceSubmit}
            onCancel={handleCancel}
          /> : null
        }
        { can(projectMedia.permissions, 'update ProjectMedia') && action !== 'create' && (action === 'change' || source === null) ?
          <ChangeMediaSource
            createNewClick={handleCreateNewSource}
            projectMediaPermissions={projectMedia.permissions}
            team={team}
            onCancel={handleCancel}
            onSubmit={handleChangeSourceSubmit}
          /> : null
        }
      </div>
    </React.Fragment>
  );
};

const MediaSource = ({ params, projectMedia }) => {
  const teamSlug = window.location.pathname.match(/^\/([^/]+)/)[1];
  let ids = null;

  // Accessing through /.../source
  if (params) {
    ids = `${params.mediaId},${params.projectId}`;
  } else {
    const projectId = projectMedia.project_id;
    ids = `${projectMedia.dbid},${projectId}`;
  }

  return (
    <ErrorBoundary component="MediaSource">
      <QueryRenderer
        environment={Relay.Store}
        query={graphql`
          query MediaSourceQuery($ids: String!, $teamSlug: String!) {
            project_media(ids: $ids) {
              id
              dbid
              archived
              pusher_channel
              permissions
              team {
                slug
                ...ChangeMediaSource_team
              }
              source {
                id
                ...SourceInfo_source @arguments(teamSlug: $teamSlug)
              }
            }
            about {
              ...SourceInfo_about
            }
          }
        `}
        render={({ error, props }) => {
          if (!error && !props) {
            return <Loader size="medium" theme="grey" variant="inline" />;
          }

          if (!error && props) {
            return <MediaSourceComponent about={props.about} projectMedia={props.project_media} />;
          }

          // TODO: We need a better error handling in the future, standardized with other components
          return null;
        }}
        variables={{
          ids,
          teamSlug,
        }}
      />
    </ErrorBoundary>
  );
};

export default MediaSource;
