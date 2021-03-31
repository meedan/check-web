import React from 'react';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import CreateTeamCard from './CreateTeamCard';
import PageTitle from '../PageTitle';
import { ContentColumn } from '../../styles/js/shared';
import FindPublicTeamRoute from '../../relay/FindPublicTeamRoute';
import RelayContainer from '../../relay/RelayContainer';

const AddTeamComponent = () => (
  <PageTitle prefix={<FormattedMessage id="addTeamPage.titleFind" defaultMessage="Find an existing workspace" />}>
    <main className="create-team">
      <ContentColumn narrow>
        <CreateTeamCard />
      </ContentColumn>
    </main>
  </PageTitle>
);

const AddTeamContainer = Relay.createContainer(AddTeamComponent, {
  fragments: {
    team: () => Relay.QL`
      fragment on PublicTeam {
        id,
        dbid,
        slug,
      }
    `,
  },
});

const AddTeam = (props) => {
  const route = new FindPublicTeamRoute({ teamSlug: props.params.slug });

  return (
    <RelayContainer
      Component={AddTeamContainer}
      route={route}
      forceFetch
      renderFetched={data => <AddTeamContainer {...props} {...data} />}
    />
  );
};

export default AddTeam;
