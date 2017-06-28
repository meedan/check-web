import React, { Component } from 'react';
import config from 'config';
import Relay from 'react-relay';
import UpdateProjectMediaMutation from '../relay/UpdateProjectMediaMutation';

class AuthorPicture extends Component {
  constructor(props) {
    super(props);

    this.state = {
      avatarUrl: props.data.author_picture === '' ? this.defaultAvatar() : (props.data.author_picture || this.refreshAvatar()),
    };
  }

  handleAvatarError() {
    this.setState({ avatarUrl: this.refreshAvatar() });
  }

  refreshAvatar() {
    const onFailure = (transaction) => {
    };

    const onSuccess = (response) => {
      const avatarUrl = JSON.parse(response.updateProjectMedia.project_media.embed).author_picture || this.defaultAvatar();
      this.setState({ avatarUrl });
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
    return(
      <img src={this.state.avatarUrl} className="social-media-card__author-avatar" onError={this.handleAvatarError.bind(this)} />
    );
  }
}

export default AuthorPicture;
