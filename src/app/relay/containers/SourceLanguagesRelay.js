import React from 'react';
import { injectIntl } from 'react-intl';
import Relay from 'react-relay';
import SourceLanguages from '../../components/source/SourceLanguages';
import AboutRoute from '../../relay/AboutRoute';

const SourceLanguagesContainer = Relay.createContainer(injectIntl(SourceLanguages), {
  fragments: {
    about: () => Relay.QL`
      fragment on About {
        languages_supported
      }
    `,
  },
});

const SourceLanguagesRelay = (props) => {
  const route = new AboutRoute();
  return (<Relay.RootContainer
    Component={SourceLanguagesContainer}
    route={route}
    renderFetched={data => <SourceLanguagesContainer {...props} {...data} />}
  />);
};

export default SourceLanguagesRelay;
