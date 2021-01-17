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
import UploadFile from '../UploadFile';
import Message from '../Message';
import globalStrings from '../../globalStrings';
import CreateSourceMutation from '../../relay/mutations/CreateSourceMutation';
import UpdateProjectMediaMutation from '../../relay/mutations/UpdateProjectMediaMutation';
import { getCurrentProjectId } from '../../helpers';

class MediaSourceComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sourceAction: 'view',
      submitDisabled: false,
      image: null,
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

  handleImageChange = (file) => {
    this.setState({ image: file });
  }

  handleImageError = (file, message) => {
    this.setState({ message, image: null });
  }

  handleSubmit(e) {
    e.preventDefault();

    if (!this.state.submitDisabled) {
      const onFailure = () => {};
      const onSuccess = () => {};
      const form = document.forms['create-source-form'];
      Relay.Store.commitUpdate(
        new CreateSourceMutation({
          name: form.name.value,
          slogan: form.name.value,
          image: this.state.image,
          mediaId: this.props.media.dbid,
        }),
        { onSuccess, onFailure },
      );
      this.setState({ message: null, submitDisabled: true, sourceAction: 'view' });
    }
  }

  handleCancel() {
    this.setState({ sourceAction: 'view' });
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
    return (
      <React.Fragment>
        <div id="media__source" style={this.props.style}>
          {this.state.sourceAction === 'view' && source !== null ?
            <SourceInfo
              source={source}
              team={team}
            /> : null
          }
          {this.state.sourceAction === 'create' ?
            <div id="media_source-create" style={{ padding: '8px 5px', width: '85%' }}>
              <Message message={this.state.message} />
              <form
                onSubmit={this.handleSubmit.bind(this)}
                name="create-source-form"
              >
                <UploadFile
                  type="image"
                  value={this.state.image}
                  onChange={this.handleImageChange}
                  onError={this.handleImageError}
                />
                <TextField
                  className="source__name-input"
                  name="name"
                  id="source__name-container"
                  label={
                    <FormattedMessage
                      id="mediaSource.sourceName"
                      defaultMessage="Name"
                      description="Label for create source name"
                    />
                  }
                  style={{ width: '85%' }}
                  margin="normal"
                />
              </form>
              <div className="source__new-buttons-cancel-save">
                <Button
                  className="source__new-cancel-button"
                  onClick={this.handleCancel.bind(this)}
                >
                  <FormattedMessage {...globalStrings.cancel} />
                </Button>
                <Button
                  variant="contained"
                  className="source__new-save-button"
                  color="primary"
                  onClick={this.handleSubmit.bind(this)}
                >
                  <FormattedMessage {...globalStrings.save} />
                </Button>
              </div>
            </div> : null
          }
          {this.state.sourceAction === 'change' ?
            <div id="media_source-create" style={{ padding: '8px 5px', width: '85%' }}>
              <div style={{ width: 300 }}>
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
