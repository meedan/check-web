import React, { Component } from 'react';
import Relay from 'react-relay/classic';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import cx from 'classnames/bind';
import UpdateSourceMutation from '../../relay/mutations/UpdateSourceMutation';
import UpdateAccountMutation from '../../relay/mutations/UpdateAccountMutation';
import styles from './Source.module.css';

class SourcePicture extends Component {
  constructor(props) {
    super(props);

    this.state = {
      avatarUrl: this.defaultAvatar(),
      queriedBackend: false,
    };
  }

  componentDidMount() {
    if (this.props.object) {
      this.setImage(this.props.object.image);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.object &&
      nextProps.object.image &&
      this.state.avatarUrl !== nextProps.object.image
    ) {
      this.setImage(nextProps.object.image);
    }
  }

  setImage(image) {
    // Don't use screeshots as a source image
    if (image && image !== '' && image !== this.state.avatarUrl && !image.match(/\/screenshots\//)) {
      this.setState({ avatarUrl: image });
    }
  }

  handleAvatarError() {
    if (this.state.avatarUrl !== this.defaultAvatar()) {
      this.setState({ avatarUrl: this.defaultAvatar() });
    }
    this.refreshAvatar();
  }

  isUploadedImage() {
    if (this.props.type === 'account') {
      return false;
    }
    const remoteLink = document.createElement('a');
    remoteLink.href = config.restBaseUrl;
    const avatarLink = document.createElement('a');
    avatarLink.href = this.props.object.image;
    return avatarLink.host === remoteLink.host;
  }

  refreshAvatar() {
    if (this.state.queriedBackend) {
      return;
    }

    this.setState({ avatarUrl: this.defaultAvatar(), queriedBackend: true });

    if (!this.isUploadedImage()) {
      const onFailure = () => {
        this.setState({
          avatarUrl: this.defaultAvatar(),
          queriedBackend: true,
        });
      };

      const onSuccess = (response) => {
        let avatarUrl = this.defaultAvatar();
        try {
          if (['source', 'user'].includes(this.props.type)) {
            avatarUrl = response.updateSource.source.image;
          } else if (this.props.type === 'account') {
            avatarUrl = response.updateAccount.account.image;
          }
        } catch (e) {
          // Do nothing.
        }
        this.setState({ avatarUrl, queriedBackend: true });
      };

      if (!this.state || !this.state.queriedBackend) {
        let mutation = null;
        if (this.props.type === 'source') {
          mutation = new UpdateSourceMutation({
            source: {
              refresh_accounts: 1,
              id: this.props.object.id,
            },
          });
        } else if (this.props.type === 'account') {
          mutation = new UpdateAccountMutation({
            account: {
              id: this.props.object.id,
            },
          });
        }
        Relay.Store.commitUpdate(mutation, { onSuccess, onFailure });
      }
    }
  }

  defaultAvatar() {
    return this.props.type === 'source'
      ? config.restBaseUrl.replace(/\/api.*/, '/images/source.png')
      : config.restBaseUrl.replace(/\/api.*/, '/images/user.png');
  }

  render() {
    return (
      <div
        alt="avatar"
        avatarUrl={this.state.avatarUrl}
        className={cx(
          styles['source-picture'],
          {
            [this.props.className]: true,
            [styles.sizeLarge]: this.props.size === 'large',
            [styles.sizeSmall]: this.props.size === 'small',
            [styles.sizeExtraSmall]: this.props.size === 'extraSmall',
            [styles.sourceImage]: this.props.type === 'source',
          })
        }
        size={this.props.size}
        style={{ backgroundImage: `url(${this.state.avatarUrl})` }}
        type={this.props.type}
        onError={this.handleAvatarError.bind(this)}
      />
    );
  }
}

export default SourcePicture;
