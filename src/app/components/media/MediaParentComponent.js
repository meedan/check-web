import React from 'react';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import MediaComponent from './MediaComponent';
import Can from '../Can';
import Translation from '../translation/Translation';

const MediaParentComponent = (props) => {
  const extraComponents = config.appName === 'bridge' ?
    [
      <Can
        key={props.media.id}
        permissions={props.media.permissions}
        permission="create Dynamic"
      >
        <Translation annotated={props.media} annotatedType="ProjectMedia" />
      </Can>,
    ] : [];

  return <MediaComponent {...props} extras={extraComponents} />;
};

export default MediaParentComponent;
