import React, { Component } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router';
import TeamHeader from './team/TeamHeader';
import ProjectHeader from './project/ProjectHeader';
import HeaderActions from './HeaderActions';
import ContentColumn from './layout/ContentColumn';
import { stringHelper } from '../customHelpers';
import { black02, units, headerHeight } from '../styles/js/variables';

const TeamHeaderContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  min-width: ${units(6)};
  overflow: hidden;
`;

const TeamContentColumn = styled(ContentColumn)`
  display: flex;
  height: 100%;
  position: relative;
`;

const HeaderAppLink = styled(Link)`
  align-items: center;
  display: flex;

  img {
    width: ${units(8)};
  }
`;

const HeaderContainer = styled.div`
  background: ${black02};
  height: ${headerHeight};
  position: absolute;
  width: 100%;
  z-index: 1;
`;

class Header extends Component {
  render() {
    const { loggedIn } = this.props;
    const path = this.props.location
      ? this.props.location.pathname
      : window.location.pathname;
    const showCheckLogo = /^\/(check(\/.*)?)?$/.test(path);

    const defaultHeader = (
      <HeaderContainer>
        <TeamContentColumn wide>
          {showCheckLogo
            ? <HeaderAppLink to="/check/teams">
              <img alt="Team Logo" src={stringHelper('LOGO_URL')} />
            </HeaderAppLink>
            : <TeamHeaderContainer>
              <TeamHeader {...this.props} />
            </TeamHeaderContainer>}
          <ProjectHeader {...this.props} />
          <HeaderActions {...this.props} loggedIn={loggedIn} />
        </TeamContentColumn>
      </HeaderContainer>
    );

    return defaultHeader;
  }
}

export default Header;
