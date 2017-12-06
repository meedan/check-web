import React from 'react';
import { injectIntl } from 'react-intl';
import Relay from 'react-relay';
import Trash from '../../components/team/Trash';
import TeamRoute from '../TeamRoute';

const TrashContainer = Relay.createContainer(Trash, {
  fragments: {
    team: () => Relay.QL`
      fragment on Team {
        id
        dbid
        slug
        permissions
        trash_size
        search_id
      }
    `,
  },
});

const TrashRelay = (props) => {
  const slug = props.params.team || '';
  const route = new TeamRoute({ teamSlug: slug });
  return (
    <Relay.RootContainer
      Component={TrashContainer}
      forceFetch
      route={route}
      renderFetched={data => <TrashContainer {...props} {...data} />}
    />
  );
};

export default injectIntl(TrashRelay);
