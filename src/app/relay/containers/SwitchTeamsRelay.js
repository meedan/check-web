import React from 'react';
import Relay from 'react-relay';
import {
  injectIntl,
} from 'react-intl';
import MeRoute from '../MeRoute';
import userFragment from '../userFragment';
import SwitchTeams from '../../components/team/SwitchTeams';

const SwitchTeamsContainer = Relay.createContainer(injectIntl(SwitchTeams), {
  fragments: {
    user: () => userFragment,
  },
});

const SwitchTeamsRelay = () => {
  const route = new MeRoute();
  return (
    <Relay.RootContainer
      Component={SwitchTeamsContainer}
      route={route}
      forceFetch
    />
  );
};

export default SwitchTeamsRelay;
