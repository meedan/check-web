import React, { Component } from 'react';
import Relay from 'react-relay';
import TeamRoute from '../relay/TeamRoute';
import teamFragment from '../relay/teamFragment';
import DrawerContentsComponent from './DrawerContentsComponent';

class DrawerContents extends Component {

  render() {
    const DrawerContentsContainer = Relay.createContainer(DrawerContentsComponent, {
      fragments: {
        team: () => teamFragment,
      },
    });

    const teamSlug = this.props.params && this.props.params.team
      ? this.props.params.team
      : '';

    const route = new TeamRoute({ teamSlug });

    return (
      <Relay.RootContainer
        Component={DrawerContentsContainer}
        route={route}
        renderFetched={data => <DrawerContentsContainer {...this.props} {...data} />}
      />
    );
  }
}

export default DrawerContents;
