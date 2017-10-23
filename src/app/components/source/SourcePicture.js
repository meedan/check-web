import React, { Component } from 'react';
import config from 'config';
import Relay from 'react-relay';
import styled from 'styled-components';
import UpdateSourceMutation from '../../relay/UpdateSourceMutation';
import UpdateAccountMutation from '../../relay/UpdateAccountMutation';
import {
  avatarSizeLarge,
  avatarSize,
  avatarSizeSmall,
  avatarSizeExtraSmall,
  defaultBorderRadius,
  black05,
} from '../../styles/js/shared';

// Sources are square. If the image is not square,
// shink it to show the whole logo.
// Users are round. If the image is not round,
// stretch it to cover it the whole circle.
const StyledImage = styled.div`
  flex-shrink: 0;
  align-self: flex-start;
  border-radius: ${props =>
    props.type === 'source' ? defaultBorderRadius : '50%'};
  background-repeat: no-repeat;
  background-position: center;
  background-size: ${props => props.type === 'source' ? 'contain' : 'cover'};
  background-image: url('${props => props.avatarUrl}');
  ${props => props.type === 'source' ? `border: 1px solid ${black05};` : null}

  ${props => (() => {
    if (props.size === 'large') {
      return (`
        width: ${avatarSizeLarge};
        height: ${avatarSizeLarge};
      `);
    } else if (props.size === 'small') {
      return (`
        width: ${avatarSizeSmall};
        height: ${avatarSizeSmall};
      `);
    } else if (props.size === 'extraSmall') {
      return (`
        width: ${avatarSizeExtraSmall};
        height: ${avatarSizeExtraSmall};
      `);
    }
    return (`
        width: ${avatarSize};
        height: ${avatarSize};
    `);
  })()}
`;

class SourcePicture extends Component {
  constructor(props) {
    super(props);

    this.state = {
      avatarUrl: this.defaultAvatar(),
      queriedBackend: false,
    };
  }

  componentDidMount() {
    this.setImage(this.props.object.image);
  }

  componentWillReceiveProps(nextProps) {
    if (
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
          const object = this.props.type === 'source' ||
            this.props.type === 'user'
            ? response.updateSource.source
            : this.props.type === 'account'
              ? response.updateAccount.account
              : {};
          avatarUrl = object.image || this.defaultAvatar();
        } catch (e) {}
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
      <StyledImage
        alt="avatar"
        size={this.props.size}
        type={this.props.type}
        className={`${this.props.className}`}
        onError={this.handleAvatarError.bind(this)}
        style={this.props.style}
        avatarUrl={this.state.avatarUrl}
      />
    );
  }
}

export default SourcePicture;
