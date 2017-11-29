import React, { Component } from 'react';
import config from 'config';
import MediaComponent from './MediaComponent';
import Can from '../Can';
import TranslationRelay from '../../relay/containers/TranslationRelay';

class MediaParentComponent extends Component {
  render() {
    const extraComponents = config.appName === 'bridge'
      ? [
        <Can
          key={this.props.media.id}
          permissions={this.props.media.permissions}
          permission="create Dynamic"
        >
          <TranslationRelay annotated={this.props.media} annotatedType="ProjectMedia" />
        </Can>,
      ]
      : [];

    return <MediaComponent {...this.props} extras={extraComponents} />;
  }
}

export default MediaParentComponent;
