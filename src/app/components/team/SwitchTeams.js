import React from 'react';
import Relay from 'react-relay';
import {
  injectIntl,
} from 'react-intl';
import MeRoute from '../../relay/MeRoute';
import userFragment from '../../relay/userFragment';
import SwitchTeamsComponent from './SwitchTeamsComponent';

const SwitchTeamsContainer = Relay.createContainer(
  injectIntl(SwitchTeamsComponent),
  {
    fragments: {
      user: () => userFragment,
    },
  },
);

function SwitchTeams() {
  const route = new MeRoute();
  return (
    <Relay.RootContainer
      Component={SwitchTeamsContainer}
      route={route}
      forceFetch
    />
  );
}

export default SwitchTeams;
