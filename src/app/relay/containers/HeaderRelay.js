import React from 'react';
import Relay from 'react-relay';
import PublicTeamRoute from '../../relay/PublicTeamRoute';
import teamPublicFragment from '../../relay/teamPublicFragment';
import Header from '../../components/Header';

const HeaderRelay = (props) => {
  if (props.inTeamContext) {
    const HeaderContainer = Relay.createContainer(Header, {
      fragments: {
        team: () => teamPublicFragment,
      },
    });

    const teamSlug = props.params.team;

    const route = new PublicTeamRoute({ teamSlug });

    return (
      <Relay.RootContainer
        Component={HeaderContainer}
        route={route}
        renderFetched={data => <HeaderContainer {...props} {...data} />}
      />
    );
  }

  return <Header {...props} />;
};

export default HeaderRelay;
