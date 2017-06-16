import React, { Component, PropTypes } from 'react';
import MediaComponent from './MediaComponent';
import Can from '../Can';
import Translation from '../translation/Translation';
import config from 'config';

class MediaParentComponent extends Component {
  render() {

    const extraComponents = [
      <Can permissions={this.props.media.permissions} permission="create Dynamic">
        <Translation annotated={this.props.media} annotatedType="ProjectMedia" />
      </Can>
    ];

    return config.appName === 'bridge' ? (
      <MediaComponent {...this.props} extras={extraComponents} />
    ) : (
      <MediaComponent {...this.props} />
    );
  }
}

export default MediaParentComponent;
