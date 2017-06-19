import React, { Component } from 'react';
import config from 'config';
import Relay from 'react-relay';
import UpdateProjectMediaMutation from '../relay/UpdateProjectMediaMutation';
import MediaUtil from './media/MediaUtil';
import deepEqual from 'deep-equal';

class AuthorPicture extends Component {
  constructor(props) {
    super(props);

    this.state = {
      avatarUrl: MediaUtil.authorAvatarUrl(props.media, props.data) || this.refreshAvatar(),
    };
  }

  handleAvatarError() {
    this.setState({ avatarUrl: this.refreshAvatar() });
  }

  refreshAvatar() {
    const onFailure = (transaction) => {
    };

    const onSuccess = (response) => {
      this.setState({ avatarUrl: JSON.parse(response.updateProjectMedia.project_media.embed).author_picture });
    };
/*
    Relay.Store.commitUpdate(
      new UpdateProjectMediaMutation({
        refresh_media: 1,
        id: this.props.media.id,
      }),
      { onSuccess, onFailure },
    );
*/
    return this.defaultAvatar();
  }

  componentWillReceiveProps(nextProps) {
    if (!deepEqual(nextProps, this.props)) {
      this.setState({ avatarUrl: MediaUtil.authorAvatarUrl(nextProps.media, nextProps.data) || this.refreshAvatar() });
    }
  }

  defaultAvatar() {
    return config.restBaseUrl.replace(/\/api.*/, '/images/user.png');
  }

  render() {
    return(
      <img src={this.state.avatarUrl} className="social-media-card__author-avatar" onError={this.handleAvatarError.bind(this)} />
    );
  }
}

export default AuthorPicture;
