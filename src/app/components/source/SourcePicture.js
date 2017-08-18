import React, { Component } from 'react';
import config from 'config';
import Relay from 'react-relay';

class SourcePicture extends Component {
  constructor(props) {
    super(props);

    this.state = {
      avatarUrl: props.source.image === '' ? this.defaultAvatar() : (props.source.image || this.refreshAvatar()),
      queriedBackend: false
    };
  }

  handleAvatarError() {
    this.setState({ avatarUrl: this.refreshAvatar() });
  }

  refreshAvatar() {
    const onFailure = (transaction) => {
      this.setState({ avatarUrl: this.defaultAvatar(), queriedBackend: true });
    };

    const onSuccess = (response) => {
      console.log(response);
      const avatarUrl = /*response.updateProjectSource.project_source.source.image || */this.defaultAvatar();
      this.setState({ avatarUrl, queriedBackend: true });
    };

    if (!this.state || !this.state.queriedBackend) {
      console.log('SourcePicture: refreshing backend...');
      /*
      Relay.Store.commitUpdate(
        new UpdateProjectSourceMutation({
          refresh_accounts: 1,
          id: this.props.source.id,
        }),
        { onSuccess, onFailure },
      );
      */
    }

    return this.defaultAvatar();
  }

  defaultAvatar() {
    return config.restBaseUrl.replace(/\/api.*/, '/images/source.png');
  }

  render() {
    return(
      <img src={this.state.avatarUrl} className="social-media-card__author-avatar" onError={this.handleAvatarError.bind(this)} />
    );
  }
}

export default SourcePicture;
