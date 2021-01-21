import React from 'react';
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql, commitMutation } from 'react-relay/compat';
import { makeStyles } from '@material-ui/core/styles';
import MediasLoading from './MediasLoading';
import ChangeMediaSource from './ChangeMediaSource';
import SourceInfo from '../source/SourceInfo';
import CreateMediaSource from './CreateMediaSource';
import { getCurrentProjectId } from '../../helpers';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(2),
  },
}));

const MediaSourceComponent = ({ cachedMedia, media }) => {
  const [action, setAction] = React.useState('view');
  const classes = useStyles();

  const handleChangeSourceSubmit = (value) => {
    if (value) {
      const onFailure = () => {}; // FIXME: Add error handling
      const onSuccess = () => { setAction('view'); };

      commitMutation(Relay.Store, {
        mutation: graphql`
          mutation MediaSourceChangeSourceMutation($input: UpdateProjectMediaInput!) {
            updateProjectMedia(input: $input) {
              project_media {
                source {
                  id
                  dbid
                  image
                  name
                  pusher_channel
                  medias_count
                  permissions
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
                }
              }
            }
          }
        `,
        variables: {
          input: {
            id: media.id,
            source_id: value.dbid,
          },
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
  const handleCreateNewSource = () => setAction('create');
  const handleChangeSource = () => setAction('change');

  const projectMedia = Object.assign(cachedMedia, media);
  const { team, source } = projectMedia;

  return (
    <React.Fragment>
      <div id="media__source" className={classes.root}>
        { action === 'view' && source !== null ?
          <SourceInfo
            source={source}
            team={team}
            onChangeClick={handleChangeSource}
          /> : null
        }
        { action === 'create' ?
          <CreateMediaSource
            media={projectMedia}
            onCancel={handleCancel}
            relateToExistingSource={handleChangeSourceSubmit}
          /> : null
        }
        { action === 'change' || source === null ?
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

const MediaSource = ({ projectMedia }) => {
  const projectId = getCurrentProjectId(projectMedia.project_ids);
  const ids = `${projectMedia.dbid},${projectId}`;

  return (
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query MediaSourceQuery($ids: String!) {
          project_media(ids: $ids) {
            id
            dbid
            archived
            pusher_channel
            team {
              slug
              ...ChangeMediaSource_team
            }
            source {
              id
              dbid
              image
              name
              pusher_channel
              medias_count
              permissions
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
            }
          }
        }
      `}
      variables={{
        ids,
      }}
      render={({ error, props }) => {
        if (!error && !props) {
          return <MediasLoading count={1} />;
        }

        if (!error && props) {
          return <MediaSourceComponent cachedMedia={projectMedia} media={props.project_media} />;
        }

        // TODO: We need a better error handling in the future, standardized with other components
        return null;
      }}
    />
  );
};

export default MediaSource;
