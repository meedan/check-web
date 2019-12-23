import React from 'react';
import { expect } from 'chai';
import IconArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import { HeaderComponent } from '../../src/app/components/Header';
import TeamHeader from '../../src/app/components/team/TeamHeader';
import TeamPublicHeader from '../../src/app/components/team/TeamPublicHeader';
import { mountWithIntl } from './helpers/intl-test';

describe('<HeaderComponent />', () => {
  // it('renders the Check logo and not TeamHeader or TeamPublicHeader on 404 page', () => {
  //   const location = { pathname: '/check/not-found' };
  //   const params = { team: 'team' };
  //   const header = mountWithIntl(
  //     <HeaderComponent
  //       inTeamContext={false}
  //       loggedIn
  //       location={location}
  //       params={params}
  //     />,
  //   );
  //   expect(header.find('[src="/images/logo/check.svg"]')).to.have.length(1);
  //   expect(header.find(TeamHeader)).to.have.length(0);
  //   expect(header.find(TeamPublicHeader)).to.have.length(0);
  // });
});
