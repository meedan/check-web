import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Relay from 'react-relay/classic';
import TeamPublicHeader from './team/TeamPublicHeader';
import ProjectHeader from './project/ProjectHeader';
import CheckContext from '../CheckContext';
import PublicTeamRoute from '../relay/PublicTeamRoute';
import teamPublicFragment from '../relay/teamPublicFragment';

import {
  units,
  mediaQuery,
  headerHeight,
  Row,
  black02,
} from '../styles/js/shared';

const HeaderBar = styled.div`
  background-color: ${black02};
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
class HeaderComponent extends React.Component {
  componentWillMount() {
    this.handleQuery();
  }

  getContext() {
    return new CheckContext(this).getContextStore();
  }

  handleQuery = () => {
    const { team, teamSlug } = this.props;

    if (!team && teamSlug) {
      this.getContext().history.push('/check/not-found');
    }
  };

  render() {
    const {
      team,
      currentUserIsMember,
    } = this.props;

    const path = window.location.pathname;

    const tasksPage = /^\/[^/]+\/project\/[0-9]+\/media\/[0-9]+\/tasks$/.test(path);
    const mediaPage = /^\/[^/]+\/(project\/[0-9]+\/)?media\/[0-9]+$/.test(path);
    const sourcePage = /^\/[^/]+\/project\/[0-9]+\/source\/[0-9]+$/.test(path);

    if (tasksPage || (!mediaPage && !sourcePage)) {
      return null;
    }

    const inTeamContext = team ? this.props.inTeamContext : false;

    const teamPrivateContentShouldShow =
      (inTeamContext && currentUserIsMember) || (inTeamContext && !this.props.team.private);

    const teamPublicContentShouldShow =
      inTeamContext && !currentUserIsMember && this.props.team.private;

    const primary = (() => {
      if (teamPrivateContentShouldShow) {
        return (
          <Row containsEllipsis>
            <div><ProjectHeader isRtl {...this.props} /></div>
          </Row>
        );
      } else if (teamPublicContentShouldShow) {
        return (
          <Row containsEllipsis>
            <TeamPublicHeader isRtl {...this.props} />
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
}

HeaderComponent.contextTypes = {
  store: PropTypes.object,
};

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
