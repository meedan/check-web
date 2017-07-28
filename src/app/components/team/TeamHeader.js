import React, { Component } from 'react';
import Relay from 'react-relay';
import { Link } from 'react-router';
import TeamRoute from '../../relay/TeamRoute';
import teamFragment from '../../relay/teamFragment';
import TeamHeaderComponent from './TeamHeaderComponent';
import { avatarSize, appBarInnerHeight, defaultBorderRadius, Pulse } from '../../styles/js/variables';

const TeamHeaderContainer = Relay.createContainer(TeamHeaderComponent, {
  fragments: {
    team: () => teamFragment,
  },
});

// Hmm... This padding has to be manually balanced to match the
// loaded state of the team icon in the AppBar.
// 2017-7-24 CGB
//
const styles = {
  loadingHeaderOuterStyle: {
    height: appBarInnerHeight,
    display: 'flex',
    alignItems: 'center',
  },
  loadingHeaderInnerStyle: {
    borderRadius: defaultBorderRadius,
    height: avatarSize,
    width: avatarSize,
    backgroundColor: 'white',
  },
};


class TeamHeader extends Component {
  render() {
    const teamSlug = this.props.params && this.props.params.team
      ? this.props.params.team
      : '';

    const route = new TeamRoute({ teamSlug });

    const loadingPlaceholder = (
      <nav style={styles.loadingHeaderOuterStyle} >
        <Link to={`/${teamSlug}`}>
          <Pulse style={styles.loadingHeaderInnerStyle} />
        </Link>
      </nav>
    );

    return (
      <Relay.RootContainer
        Component={TeamHeaderContainer}
        route={route}
        renderLoading={function () {
          return (
            loadingPlaceholder
          );
        }}
      />
    );
  }
}

export default TeamHeader;
