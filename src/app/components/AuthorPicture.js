import React, { Component } from 'react';
import config from 'config';
import Relay from 'react-relay';
import UpdateProjectMediaMutation from '../relay/UpdateProjectMediaMutation';
import MediaUtil from './media/MediaUtil';

class AuthorPicture extends Component {
  constructor(props) {
    super(props);

    this.state = {
      authorPicture: null,
    };
  }

  handleAvatarError() {
    this.setState({ authorPicture: this.refreshMedia() });
  }

  refreshMedia() {
    const onFailure = (transaction) => {
    };

    const onSuccess = (response) => {
      this.setState({ authorPicture: JSON.parse(response.updateProjectMedia.project_media.embed).author_picture });
    };

    Relay.Store.commitUpdate(
      new UpdateProjectMediaMutation({
        refresh_media: 1,
        id: this.props.media.id,
      }),
      { onSuccess, onFailure },
    );

    return config.restBaseUrl.replace(/\/api.*/, '/images/user.png');
  }

  render() {
    const { media, data } = this.props;
    const authorAvatarUrl = this.state.authorPicture || MediaUtil.authorAvatarUrl(media, data) || this.refreshMedia();
    return(
      <img src={authorAvatarUrl} className="social-media-card__author-avatar" onError={this.handleAvatarError.bind(this)} />
    );
  }
}

export default AuthorPicture;
