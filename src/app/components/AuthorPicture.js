import React, { Component } from 'react';
import config from 'config';
import Relay from 'react-relay';
import UpdateProjectMediaMutation from '../relay/UpdateProjectMediaMutation';
import MediaUtil from './media/MediaUtil';

class AuthorPicture extends Component {
  constructor(props) {
    super(props);

    this.state = {
      avatarUrl: null,
    };
  }

  handleAvatarError() {
    this.setState({ avatarUrl: this.state.avatarUrl ? this.defaultAvatar() : this.refreshAvatar() });
  }

  refreshAvatar() {
    const onFailure = (transaction) => {
    };

    const onSuccess = (response) => {
      this.setState({ avatarUrl: JSON.parse(response.updateProjectMedia.project_media.embed).author_picture });
    };

    Relay.Store.commitUpdate(
      new UpdateProjectMediaMutation({
        refresh_media: 1,
        id: this.props.media.id,
      }),
      { onSuccess, onFailure },
    );

    return this.defaultAvatar();
  }

  defaultAvatar() {
    return config.restBaseUrl.replace(/\/api.*/, '/images/user.png');
  }

  render() {
    const { media, data } = this.props;
    const authorAvatarUrl = this.state.avatarUrl || MediaUtil.authorAvatarUrl(media, data) || this.refreshAvatar();
    return(
      <img src={authorAvatarUrl} className="social-media-card__author-avatar" onError={this.handleAvatarError.bind(this)} />
    );
  }
}

export default AuthorPicture;
