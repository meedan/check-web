import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { withPusher, pusherShape } from '../../pusher';
import MediaRoute from '../../relay/MediaRoute';
import MediasLoading from './MediasLoading';
import SourceInfo from '../source/SourceInfo';
import CreateMediaSource from './CreateMediaSource';
import UpdateProjectMediaMutation from '../../relay/mutations/UpdateProjectMediaMutation';
import { getCurrentProjectId } from '../../helpers';

class MediaSourceComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sourceAction: 'view',
      mediaSourceValue: null,
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
    pusher.subscribe(media.pusher_channel).bind('media_updated', 'MediaSource', (data, run) => {
      const annotation = JSON.parse(data.message);
      if (annotation.annotated_id === media.dbid && clientSessionId !== data.actor_session_id) {
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

  handleChangeSourceBarLink() {
    let sourceAction = 'view';
    if (this.state.sourceAction === 'view') {
      sourceAction = 'change';
    } else if (this.state.sourceAction === 'change') {
      sourceAction = 'create';
    }
    this.setState({ sourceAction });
  }

  handleChangeSource(value) {
    this.setState({ mediaSourceValue: value });
  }

  handleChangeSourceSubmit() {
    if (this.state.mediaSourceValue) {
      const onFailure = () => {};
      const onSuccess = () => { this.setState({ sourceAction: 'view' }); };
      Relay.Store.commitUpdate(
        new UpdateProjectMediaMutation({
          id: this.props.media.id,
          source_id: this.state.mediaSourceValue.dbid,
        }),
        { onSuccess, onFailure },
      );
      this.setState({ mediaSourceValue: null });
    }
  }

  render() {
    const media = Object.assign(this.props.cachedMedia, this.props.media);
    const { team, source } = media;
    const teamSources = team.sources.edges.map(({ node }) => node);
    let sourceBarAction = null;
    if (this.state.sourceAction === 'view') {
      sourceBarAction = (
        <FormattedMessage
          id="mediaSource.changeSource"
          defaultMessage="Change"
          description="allow user to change a project media source"
        />
      );
    } else if (this.state.sourceAction === 'change') {
      sourceBarAction = (
        <FormattedMessage
          id="mediaSource.createSource"
          defaultMessage="Create new"
          description="allow user to create a new source"
        />
      );
    }
    return (
      <React.Fragment>
        <div id="media__source" style={this.props.style}>
          {sourceBarAction ?
            <div id="media-source-change" style={{ textAlign: 'right', textDecoration: 'underline' }}>
              <Button
                style={{ color: 'blue' }}
                onClick={this.handleChangeSourceBarLink.bind(this)}
              >
                { sourceBarAction }
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
            <div id="media_source-change" style={{ padding: '8px 5px', width: '85%' }}>
              <Autocomplete
                autoHighlight
                options={teamSources}
                getOptionLabel={option => option.name}
                getOptionSelected={(option, val) => val !== null && option.id === val.id}
                value={this.state.mediaSourceValue}
                onChange={(event, newValue) => {
                  this.handleChangeSource(newValue);
                }}
                renderInput={params => (
                  <TextField
                    {...params}
                    autoFocus
                    name="source-name"
                    label={
                      <FormattedMessage id="mediaSource.choose" defaultMessage="Choose a source" />
                    }
                    variant="outlined"
                  />
                )}
              />
              <div>
                <Button color="primary" onClick={this.handleCancel.bind(this)}>
                  <FormattedMessage id="mediaSource.cancelButton" defaultMessage="Cancel" />
                </Button>
                <Button
                  color="primary"
                  className="project-media-source-save-action"
                  onClick={this.handleChangeSourceSubmit.bind(this)}
                  disabled={!this.state.mediaSourceValue}
                >
                  <FormattedMessage id="mediaSource.saveButton" defaultMessage="Save" />
                </Button>
              </div>
            </div> : null
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

const MediaSourceContainer = Relay.createContainer(withPusher(MediaSourceComponent), {
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
          sources(first: 1000) {
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
