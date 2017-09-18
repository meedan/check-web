import React, { Component } from 'react';
import Relay from 'react-relay';
import TeamRoute from '../../relay/TeamRoute';
import teamFragment from '../../relay/teamFragment';
import TeamHeaderComponent from './TeamHeaderComponent';
import { avatarSize, headerHeight, defaultBorderRadius, Pulse } from '../../styles/js/shared';

const TeamHeaderContainer = Relay.createContainer(TeamHeaderComponent, {
  fragments: {
    team: () => teamFragment,
  },
});

const styles = {
  loadingHeaderOuterStyle: {
    height: headerHeight,
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
        <Pulse style={styles.loadingHeaderInnerStyle} />
      </nav>
    );

    return (
      <Relay.RootContainer
        Component={TeamHeaderContainer}
        route={route}
        renderLoading={function () { return loadingPlaceholder; }}
        renderFetched={data => <TeamHeaderContainer {...this.props} {...data} />}
      />
    );
  }
}

export default TeamHeader;
