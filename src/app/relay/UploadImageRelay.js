import React from 'react';
import Relay from 'react-relay';
import { injectIntl } from 'react-intl';
import UploadImage from '../components/UploadImage';
import AboutRoute from './AboutRoute';

const UploadImageContainer = Relay.createContainer(injectIntl(UploadImage), {
  fragments: {
    about: () => Relay.QL`
      fragment on About {
        upload_max_size,
        upload_extensions,
        upload_max_dimensions,
        upload_min_dimensions
      }
    `,
  },
});

const UploadImageRelay = (props) => {
  const route = new AboutRoute();
  return (<Relay.RootContainer
    Component={UploadImageContainer}
    route={route}
    renderFetched={data => <UploadImageContainer {...props} {...data} />}
  />);
};

export default UploadImageRelay;
