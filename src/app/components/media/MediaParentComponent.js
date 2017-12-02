import React from 'react';
import config from 'config';
import MediaComponent from './MediaComponent';
import Can from '../Can';
import TranslationRelay from '../../relay/containers/TranslationRelay';

const MediaParentComponent = (props) => {
  const extraComponents = config.appName === 'bridge'
    ? [
      <Can
        key={props.media.id}
        permissions={props.media.permissions}
        permission="create Dynamic"
      >
        <TranslationRelay annotated={props.media} annotatedType="ProjectMedia" />
      </Can>,
    ]
    : [];

  return <MediaComponent {...props} extras={extraComponents} />;
};

export default MediaParentComponent;
