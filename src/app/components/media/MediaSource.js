import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import { withPusher, pusherShape } from '../../pusher';
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

  componentDidMount() {
    this.subscribe();
  }

  componentWillUpdate(nextProps) {
    if (this.props.media.dbid !== nextProps.media.dbid) {
      this.unsubscribe();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.media.dbid !== prevProps.media.dbid) {
      this.subscribe();
    }
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  subscribe() {
    const { pusher, clientSessionId, media } = this.props;
    const { source } = media;
    pusher.subscribe(source.pusher_channel).bind('source_updated', 'MediaSource', (data, run) => {
      const sourceData = JSON.parse(data.message);
      if (sourceData.id === source.dbid && clientSessionId !== data.actor_session_id) {
        if (run) {
          this.props.relay.forceFetch();
          return true;
        }
        return {
          id: `media-source-${media.dbid}`,
          callback: this.props.relay.forceFetch,
        };
      }
      return false;
    });
  }

  unsubscribe() {
    const { pusher, media } = this.props;
    pusher.unsubscribe(media.pusher_channel);
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
          {this.state.sourceAction === 'view' && source === null ?
            <div id="media-source-change" style={{ textAlign: 'right', textDecoration: 'underline' }}>
              <Button
                style={{ color: 'blue' }}
                onClick={this.handleChangeSource.bind(this)}
              >
                <FormattedMessage
                  id="mediaSource.changeSource"
                  defaultMessage="Change"
                  description="allow user to change a project media source"
                />
              </Button>
            </div> : null
          }
          {this.state.sourceAction === 'view' && source !== null ?
            <SourceInfo
              source={source}
              team={team}
            /> : null
          }
          {this.state.sourceAction === 'create' ?
            <CreateMediaSource
              media={media}
              onCancel={this.handleCancel.bind(this)}
            /> : null
          }
          {this.state.sourceAction === 'change' ?
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

MediaSourceComponent.propTypes = {
  pusher: pusherShape.isRequired,
  clientSessionId: PropTypes.string.isRequired,
};

const MediaSourceContainer = Relay.createContainer(withPusher(withStyles(style)(MediaSourceComponent)), {
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
