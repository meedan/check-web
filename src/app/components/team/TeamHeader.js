import React, { Component } from 'react';
import Relay from 'react-relay';
import TeamRoute from '../../relay/TeamRoute';
import teamFragment from '../../relay/teamFragment';
import TeamHeaderComponent from './TeamHeaderComponent';
import { units, black05, defaultBorderRadius } from '../../styles/js/variables';

const TeamHeaderContainer = Relay.createContainer(TeamHeaderComponent, {
  fragments: {
    team: () => teamFragment,
  },
});

const styles = {
  headerOuterStyle: {
    padding: units(2),
    display: 'flex',
    alignItems: 'center',
    height: units(8),
  },
  headerInnerStyle: {
    borderRadius: defaultBorderRadius,
    height: units(5),
    width: units(5),
    backgroundColor: 'white',
    border: `1px solid ${black05}`,
  },
};

class TeamHeader extends Component {
  render() {
    const teamSlug = this.props.params && this.props.params.team
      ? this.props.params.team
      : '';
    const route = new TeamRoute({ teamSlug });
    return (
      <Relay.RootContainer
        Component={TeamHeaderContainer}
        route={route}
        renderLoading={function () {
          return (
            <nav style={styles.headerOuterStyle} >
              <div style={styles.headerInnerStyle} />
            </nav>
          );
        }}
      />
    );
  }
}

export default TeamHeader;
