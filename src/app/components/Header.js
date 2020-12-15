import React from 'react';
import styled from 'styled-components';
import Relay from 'react-relay/classic';
import TeamPublicHeader from './team/TeamPublicHeader';
import ProjectHeader from './project/ProjectHeader';
import PublicTeamRoute from '../relay/PublicTeamRoute';
import teamPublicFragment from '../relay/teamPublicFragment';

import {
  units,
  mediaQuery,
  headerHeight,
  Row,
  brandSecondary,
} from '../styles/js/shared';

const HeaderBar = styled.div`
  background-color: ${brandSecondary};
  display: flex;
  align-items: center;
  padding: 0 ${units(2)};
  height: ${headerHeight};
  /* Relative positioning is used here to create a new
  positioning context to avoid a z-index inconsistency
  on Safari, Safari Mobile, Ubuntu Chrome,
  Ubuntu Firefox 2017-9-20 CGB */
  position: relative;
  z-index: 1;
  ${mediaQuery.handheld`
    padding: 0 ${units(1)};
  `}
`;

// TODO Fix a11y issues
/* eslint jsx-a11y/click-events-have-key-events: 0 */
function HeaderComponent(props) {
  const { inTeamContext, team, currentUserIsMember } = props;
  const path = window.location.pathname;

  const tasksPage = /^\/[^/]+\/project\/[0-9]+\/media\/[0-9]+\/tasks$/.test(path);
  const mediaPage = /^\/[^/]+\/(project\/[0-9]+\/)?media\/[0-9]+(\/suggested-matches|\/similar-media)?$/.test(path);
  const sourcePage = /^\/[^/]+\/project\/[0-9]+\/source\/[0-9]+$/.test(path);

  if (tasksPage || (!mediaPage && !sourcePage)) {
    return null;
  }

  const reallyInTeamContext = team ? inTeamContext : false;

  const teamPrivateContentShouldShow =
    (reallyInTeamContext && currentUserIsMember) || (reallyInTeamContext && !team.private);

  const teamPublicContentShouldShow =
    reallyInTeamContext && !currentUserIsMember && team.private;

  const primary = (() => {
    if (teamPrivateContentShouldShow) {
      // TODO write props explicitly
      return (
        <Row containsEllipsis>
          <div><ProjectHeader {...props} /></div>
        </Row>
      );
    } else if (teamPublicContentShouldShow) {
      // TODO write props explicitly
      return (
        <Row containsEllipsis>
          <TeamPublicHeader {...props} />
        </Row>
      );
    }

    return null;
  })();

  return (
    <HeaderBar>
      {primary}
    </HeaderBar>
  );
}

const Header = (props) => {
  if (props.inTeamContext) {
    const HeaderContainer = Relay.createContainer(HeaderComponent, {
      fragments: {
        team: () => teamPublicFragment,
      },
    });

    const teamSlug = props.params.team;
    const route = new PublicTeamRoute({ teamSlug });

    return (
      <Relay.RootContainer
        Component={HeaderContainer}
        route={route}
        renderFetched={data => <HeaderContainer {...props} {...data} />}
      />
    );
  }

  return <HeaderComponent {...props} />;
};

export { Header as default, HeaderComponent };
