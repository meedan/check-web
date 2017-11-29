import React from 'react';
import { expect } from 'chai';
import IconArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import { HeaderComponent } from '../../src/app/components/Header';
import TeamHeaderRelay from '../../src/app/relay/containers/TeamHeaderRelay';
import TeamPublicHeaderRelay from '../../src/app/relay/containers/TeamPublicHeaderRelay';
import { mountWithIntl } from './helpers/intl-test';

describe('<HeaderComponent />', () => {
  const privateTeam = {
    name: 'team',
    avatar: 'http://localhost:3000/images/team.png',
    dbid: 1,
    private: true,
    slug: 'team',
  };

  it('renders team header on private team members page when user is a member', () => {
    const location = { pathname: '/team/members' };
    const params = { team: 'team' };
    const header = mountWithIntl(
      <HeaderComponent
        inTeamContext
        loggedIn
        currentUserIsMember
        team={privateTeam}
        location={location}
        params={params}
      />,
    );
    expect(header.find(TeamHeaderRelay)).to.have.length(1);
    expect(header.find(TeamPublicHeaderRelay)).to.have.length(0);
    expect(header.find(IconArrowBack)).to.have.length(0);
  });

  it('renders public team header on private team join page when user is not a member', () => {
    const location = { pathname: '/team/join' };
    const params = { team: 'team' };
    const header = mountWithIntl(
      <HeaderComponent
        inTeamContext
        loggedIn
        currentUserIsMember={false}
        team={privateTeam}
        location={location}
        params={params}
      />,
    );
    expect(header.find(TeamHeaderRelay)).to.have.length(0);
    expect(header.find(TeamPublicHeaderRelay)).to.have.length(1);
    expect(header.find(IconArrowBack)).to.have.length(0);
  });

  it('renders the Check logo and not TeamHeader or TeamPublicHeader on 404 page', () => {
    const location = { pathname: '/check/404' };
    const params = { team: 'team' };
    const header = mountWithIntl(
      <HeaderComponent
        inTeamContext={false}
        loggedIn
        location={location}
        params={params}
      />,
    );
    expect(header.find('[src="/images/logo/check.svg"]')).to.have.length(1);
    expect(header.find(TeamHeaderRelay)).to.have.length(0);
    expect(header.find(TeamPublicHeaderRelay)).to.have.length(0);
  });
});
