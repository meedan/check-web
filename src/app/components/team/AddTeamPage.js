import React from 'react';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import CreateTeamCard from './CreateTeamCard';
import FindTeamCard from './FindTeamCard';
import PageTitle from '../PageTitle';
import { ContentColumn } from '../../styles/js/shared';
import FindPublicTeamRoute from '../../relay/FindPublicTeamRoute';
import RelayContainer from '../../relay/RelayContainer';

const AddTeamComponent = (props) => {
  const mode = props.route.path === 'check/teams/find(/:slug)' ? 'find' : 'create';

  return (
    <PageTitle prefix={mode === 'find'
      ? <FormattedMessage id="addTeamPage.titleFind" defaultMessage="Find an existing workspace" />
      : <FormattedMessage id="addTeamPage.titleCreate" defaultMessage="Create a workspace" />
    }
    >
      <main className="create-team">
        <ContentColumn narrow>
          { mode === 'find' ?
            <FindTeamCard {...props} /> : <CreateTeamCard />
          }
        </ContentColumn>
      </main>
    </PageTitle>
  );
};

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
