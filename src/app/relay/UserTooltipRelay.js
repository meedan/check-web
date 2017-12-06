import React from 'react';
import { injectIntl } from 'react-intl';
import Relay from 'react-relay';
import UserTooltip from '../components/user/UserTooltip';
import UserRoute from './UserRoute';

const UserTooltipContainer = Relay.createContainer(injectIntl(UserTooltip), {
  fragments: {
    user: () => Relay.QL`
      fragment on User {
        id,
        dbid,
        name,
        number_of_teams,
        team_users(first: 10000) {
          edges {
            node {
              team {
                id,
                dbid,
                name,
                slug,
                private,
              }
              id,
              status,
              role
            }
          }
        },
        source {
          id,
          dbid,
          image,
          description,
          created_at,
          account_sources(first: 10000) {
            edges {
              node {
                account {
                  id,
                  url,
                  provider
                }
              }
            }
          }
        }
      }
    `,
  },
});

const UserTooltipRelay = (props) => {
  const route = new UserRoute({ userId: props.user.dbid });
  return (
    <Relay.RootContainer
      Component={UserTooltipContainer}
      route={route}
    />
  );
};

export default UserTooltipRelay;
