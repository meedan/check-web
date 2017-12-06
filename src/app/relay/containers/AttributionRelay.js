import React from 'react';
import Relay from 'react-relay';
import { injectIntl } from 'react-intl';
import TeamRoute from '../TeamRoute';
import CheckContext from '../../CheckContext';
import Attribution from '../../components/task/Attribution';

const AttributionContainer = Relay.createContainer(injectIntl(Attribution), {
  fragments: {
    team: () => Relay.QL`
      fragment on Team {
        id
        dbid
        team_users(first: 10000) {
          edges {
            node {
              id
              status
              user {
                id
                dbid
                name
              }
            }
          }
        }
      }
    `,
  },
});

const AttributionRelay = (props, context) => {
  const checkContext = new CheckContext().getContextStore(context.store);

  const route = new TeamRoute({ teamSlug: checkContext.team.slug });

  return (
    <Relay.RootContainer
      Component={AttributionContainer}
      renderFetched={data => <AttributionContainer {...props} {...data} />}
      route={route}
    />
  );
};

AttributionRelay.contextTypes = {
  store: React.PropTypes.object,
};

export default AttributionRelay;
