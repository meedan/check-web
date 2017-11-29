import React from 'react';
import { injectIntl } from 'react-intl';
import Relay from 'react-relay';
import Translation from '../../components/translation/Translation';
import AboutRoute from '../AboutRoute';

const TranslationContainer = Relay.createContainer(injectIntl(Translation), {
  fragments: {
    about: () => Relay.QL`
      fragment on About {
        languages_supported
      }
    `,
  },
});

const TranslationRelay = (props) => {
  const route = new AboutRoute();
  return (
    <Relay.RootContainer
      Component={TranslationContainer}
      route={route}
      renderFetched={data => <TranslationContainer {...props} {...data} />}
    />
  );
};

export default injectIntl(TranslationRelay);
