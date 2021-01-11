import React from 'react';
import { HeaderComponent } from './Header';
import TeamHeader from './team/TeamHeader';
import TeamPublicHeader from './team/TeamPublicHeader';
import { mountWithIntl } from '../../../test/unit/helpers/intl-test';

describe('<HeaderComponent />', () => {
  it.skip('renders the Check logo and not TeamHeader or TeamPublicHeader on 404 page', () => {
    const location = { pathname: '/check/not-found' };
    const params = { team: 'team' };
    const header = mountWithIntl(
      <HeaderComponent
        inTeamContext={false}
        loggedIn
        location={location}
        params={params}
      />,
    );
    console.log('ENTROOOOOOOOOOOOOOOOOU')

    expect(header.find('[src="/images/logo/check.svg"]')).toHaveLength(1);
    expect(header.find(TeamHeader)).toHaveLength(0);
    expect(header.find(TeamPublicHeader)).toHaveLength(0);
  });
});
