import React, { Component } from 'react';
import Relay from 'react-relay';
import TeamRoute from '../relay/TeamRoute';
import teamPublicFragment from '../relay/teamPublicFragment';
import teamFragment from '../relay/teamFragment';
import DrawerNavigationComponent from './DrawerNavigationComponent';


class DrawerNavigation extends Component {
  render() {
    const inTeamContext = this.props.inTeamContext;

    // TODO @chris with @alex 2017-10-2
    //
    // Problem:
    //
    // The current implementation breaks in some cases with a Relay error:
    //   `Server response was missing for query 'team'`
    // This happens when the Drawer tries to load for a private team context with a non-member user.
    //
    // I think we could implment `currentUserIsMember` and `teamIsPublic` (below).
    //
    // Goal of the logic below:
    //
    //   If there is a "teamContext" then render with Relay.createContainer:
    //      1a. If (currentUserIsMember || teamIsPublic) use teamFragment
    //      1b. If not a member or public team, use teamPublicFragment
    //   2. If there is no team context, render the drawer without a Relay container
    //
    // (There are more conditionals inside the DrawerNavigationComponent.)

    // TODO: implement these two constants
    const { currentUserIsMember, teamIsPublic } = this.props;

    if (inTeamContext) {
      const DrawerNavigationContainer = Relay.createContainer(DrawerNavigationComponent, {
        fragments: {
          team: () => (currentUserIsMember || teamIsPublic) ? teamFragment : teamPublicFragment,
        },
      });

      const teamSlug = this.props.params.team;

      const route = new TeamRoute({ teamSlug });
      return (
        <Relay.RootContainer
          Component={DrawerNavigationContainer}
          route={route}
          renderFetched={
            data => <DrawerNavigationContainer
              {...this.props}
              {...data}
            />
          }
        />
      );
    }

    return (<DrawerNavigationComponent {...this.props} />);
  }
}

export default DrawerNavigation;
