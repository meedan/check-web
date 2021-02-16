import React from 'react';
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql, commitMutation } from 'react-relay/compat';
import { makeStyles } from '@material-ui/core/styles';
import MediasLoading from './MediasLoading';
import ChangeMediaSource from './ChangeMediaSource';
import SourceInfo from '../source/SourceInfo';
import CreateMediaSource from './CreateMediaSource';
import { can } from '../Can';
import { getCurrentProjectId } from '../../helpers';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(2),
  },
}));


// Auto-resize the iframe when embedded in the browser extension

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

const MediaSourceComponent = ({ projectMedia }) => {
  const [action, setAction] = React.useState('view');
  const [newSourceName, setNewSourceName] = React.useState('');
  const classes = useStyles();

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

  const { team, source } = projectMedia;

  return (
    <React.Fragment>
      <div id="media__source" className={classes.root}>
        { action === 'view' && source !== null ?
          <SourceInfo
            key={source ? source.id : 0}
            source={source}
            team={team}
            onChangeClick={handleChangeSource}
          /> : null
        }
        { action === 'create' ?
          <CreateMediaSource
            name={newSourceName}
            media={projectMedia}
            onCancel={handleCancel}
            relateToExistingSource={handleChangeSourceSubmit}
          /> : null
        }
        { can(projectMedia.permissions, 'update Source') && action !== 'create' && (action === 'change' || source === null) ?
          <ChangeMediaSource
            team={team}
            onSubmit={handleChangeSourceSubmit}
            onCancel={handleCancel}
            createNewClick={handleCreateNewSource}
          /> : null
        }
      </div>
    </React.Fragment>
  );
};

const MediaSource = ({ projectMedia, params }) => {
  const teamSlug = window.location.pathname.match(/^\/([^/]+)/)[1];
  let ids = null;

  // Accessing through /.../source
  if (params) {
    ids = `${params.mediaId},${params.projectId}`;
  } else {
    const projectId = getCurrentProjectId(projectMedia.project_ids);
    ids = `${projectMedia.dbid},${projectId}`;
  }

  return (
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
        }
      `}
      variables={{
        ids,
        teamSlug,
      }}
      render={({ error, props }) => {
        if (!error && !props) {
          return <MediasLoading count={1} />;
        }

        if (!error && props) {
          return <MediaSourceComponent projectMedia={props.project_media} />;
        }

        // TODO: We need a better error handling in the future, standardized with other components
        return null;
      }}
    />
  );
};

export default MediaSource;
