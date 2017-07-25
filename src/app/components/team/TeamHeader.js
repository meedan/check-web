import React, { Component } from 'react';
import Relay from 'react-relay';
import { Link } from 'react-router';
import PublicTeamRoute from '../../relay/PublicTeamRoute';
import TeamHeaderComponent from './TeamHeaderComponent';
import { units, defaultBorderRadius, Pulse } from '../../styles/js/variables';

const TeamHeaderContainer = Relay.createContainer(TeamHeaderComponent, {
  fragments: {
    team: () => Relay.QL`
      fragment on PublicTeam {
        name,
        avatar,
        dbid,
        slug
      }
    `,
  },
});

// Hmm... This padding has to be manually balanced to match the
// loaded state of the team icon in the AppBar.
// 2017-7-24 CGB
//
const styles = {
  loadingHeaderOuterStyle: {
    padding: `${units(0.5)} ${units(2)}`,
    display: 'flex',
    alignItems: 'center',
  },
  loadingHeaderInnerStyle: {
    borderRadius: defaultBorderRadius,
    height: units(5),
    width: units(5),
    backgroundColor: 'white',
  },
};


class TeamHeader extends Component {
  render() {
    const teamSlug = this.props.params && this.props.params.team
      ? this.props.params.team
      : '';

    const route = new PublicTeamRoute({ teamSlug });

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
