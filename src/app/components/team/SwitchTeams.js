import React from 'react';
import Relay from 'react-relay/classic';
import { injectIntl } from 'react-intl';
import MeRoute from '../../relay/MeRoute';
import userFragment from '../../relay/userFragment';
import SwitchTeamsComponent from './SwitchTeamsComponent';
import MediasLoading from '../media/MediasLoading';

const SwitchTeamsContainer = Relay.createContainer(injectIntl(SwitchTeamsComponent), {
  fragments: {
    user: () => userFragment,
  },
});

const SwitchTeams = () => {
  const route = new MeRoute();
  return (
    <Relay.RootContainer
      Component={SwitchTeamsContainer}
      route={route}
      renderLoading={() => <MediasLoading />}
      forceFetch
    />
  );
};

export default SwitchTeams;
