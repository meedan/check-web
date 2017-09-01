import React, { Component } from 'react';
import config from 'config';
import MediaComponent from './MediaComponent';
import Can from '../Can';
import Translation from '../translation/Translation';

class MediaParentComponent extends Component {
  render() {
    const extraComponents = config.appName === 'bridge'
      ? [
        <Can
          key={this.props.media.id}
          permissions={this.props.media.permissions}
          permission="create Dynamic"
        >
          <Translation annotated={this.props.media} annotatedType="ProjectMedia" />
        </Can>,
      ]
      : [];

    return <MediaComponent {...this.props} extras={extraComponents} />;
  }
}

export default MediaParentComponent;
