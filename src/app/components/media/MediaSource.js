import React, { Component } from 'react';
import Relay from 'react-relay/classic';
import { withStyles } from '@material-ui/core/styles';
import MediaRoute from '../../relay/MediaRoute';
import MediasLoading from './MediasLoading';
import ChangeMediaSource from './ChangeMediaSource';
import SourceInfo from '../source/SourceInfo';
import CreateMediaSource from './CreateMediaSource';
import UpdateProjectMediaMutation from '../../relay/mutations/UpdateProjectMediaMutation';
import { getCurrentProjectId } from '../../helpers';

const style = theme => ({
  root: {
    padding: theme.spacing(2),
  },
});

class MediaSourceComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sourceAction: 'view',
    };
  }

  handleCancel() {
    this.setState({ sourceAction: 'view' });
  }

  handleCreateNewSource() {
    this.setState({ sourceAction: 'create' });
  }

  handleChangeSource() {
    this.setState({ sourceAction: 'change' });
  }

  handleChangeSourceSubmit(value) {
    if (value) {
      const onFailure = () => {};
      const onSuccess = () => { this.setState({ sourceAction: 'view' }); };
      Relay.Store.commitUpdate(
        new UpdateProjectMediaMutation({
          id: this.props.media.id,
          source_id: value.dbid,
          media: this.props.media,
          srcProj: null,
          dstProj: null,
        }),
        { onSuccess, onFailure },
      );
    }
  }

  render() {
    const media = Object.assign(this.props.cachedMedia, this.props.media);
    const { team, source } = media;
    const { classes } = this.props;

    return (
      <React.Fragment>
        <div id="media__source" className={classes.root}>
          {this.state.sourceAction === 'view' && source !== null ?
            <SourceInfo
              source={source}
              team={team}
              onChangeClick={this.handleChangeSource.bind(this)}
            /> : null
          }
          {this.state.sourceAction === 'create' ?
            <CreateMediaSource
              media={media}
              onCancel={this.handleCancel.bind(this)}
              relateToExistingSource={this.handleChangeSourceSubmit.bind(this)}
            /> : null
          }
          {this.state.sourceAction === 'change' || source === null ?
            <ChangeMediaSource
              team={team}
              onSubmit={this.handleChangeSourceSubmit.bind(this)}
              onCancel={this.handleCancel.bind(this)}
              createNewClick={this.handleCreateNewSource.bind(this)}
            /> : null
          }
        </div>
      </React.Fragment>
    );
  }
}

const MediaSourceContainer = Relay.createContainer(withStyles(style)(MediaSourceComponent), {
  fragments: {
    media: () => Relay.QL`
      fragment on ProjectMedia {
        id
        dbid
        archived
        pusher_channel
        team {
          slug
          name
          sources(first: 10000) {
            edges {
              node {
                id
                dbid
                name
              }
            }
          }
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
    `,
  },
});

const MediaSource = (props) => {
  const projectId = getCurrentProjectId(props.media.project_ids);
  const ids = `${props.media.dbid},${projectId}`;
  const route = new MediaRoute({ ids });
  const { media } = props;

  return (
    <Relay.RootContainer
      Component={MediaSourceContainer}
      renderFetched={data =>
        <MediaSourceContainer cachedMedia={media} {...data} />}
      route={route}
      renderLoading={() => <MediasLoading count={1} />}
      forceFetch
    />
  );
};

export default MediaSource;
