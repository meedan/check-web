import React, { Component } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router';
import IconButton from 'material-ui/IconButton';
import IconSearch from 'material-ui/svg-icons/action/search';
import { injectIntl } from 'react-intl';
import rtlDetect from 'rtl-detect';
import TeamHeader from './team/TeamHeader';
import TeamPublicHeader from './team/TeamPublicHeader';
import ProjectHeader from './project/ProjectHeader';
import { stringHelper } from '../customHelpers';
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
  overflow: hidden;
  /* Relative positioning is used here to create a new
  positioning context to avoid a z-index inconsistency
  on Safari, Safari Mobile, Ubuntu Chrome,
  Ubuntu Firefox 2017-9-20 CGB */
  position: relative;
  ${mediaQuery.handheld`
    padding: 0 ${units(1)};
  `}
`;

class Header extends Component {
  render() {
    const locale = this.props.intl.locale;
    const isRtl = rtlDetect.isRtlLang(locale);
    const fromDirection = isRtl ? 'right' : 'left';
    const hasTeam = this.props.params && this.props.params.team;
    const path = this.props.location
      ? this.props.location.pathname
      : window.location.pathname;
    const showCheckLogo = /^\/(check(\/.*)?)?$/.test(path);
    const joinPage = /^\/([^/]+)\/join$/.test(path);

    const AlignOpposite = styled.div`
      margin-${fromDirection}: auto;
      `;

    const searchButton = (
      <IconButton
        key="header.searchButton"
        className="header-actions__search-icon"
        containerElement={<Link to={`/${this.props.params.team}/search`} />}
        name="search"
      >
        <IconSearch />
      </IconButton>
    );

    const teamAndProjectHeader = (
      <Row containsEllipsis>
        <div><TeamHeader {...this.props} /></div>
        <div><ProjectHeader {...this.props} /></div>
      </Row>
    );

    const checkLogo = (
      <Link to="/check/teams">
        <img
          width={units(8)}
          alt="Team Logo"
          src={stringHelper('LOGO_URL')}
        />
      </Link>
    );

    const primary = (() => {
      if (showCheckLogo) {
        return checkLogo;
      }
      if (joinPage) {
        return (
          <Row containsEllipsis>
            <TeamPublicHeader {...this.props} />
          </Row>
        );
      }
      return (
        <Row containsEllipsis>
          {teamAndProjectHeader}
        </Row>
      );
    })();

    const secondary = (() => {
      if (hasTeam) {
        return (
          <AlignOpposite>
            <Row>
              {searchButton}
            </Row>
          </AlignOpposite>
        );
      }
      return (
        null
      );
    })();

    return (
      <HeaderBar>
        {primary}
        {secondary}
      </HeaderBar>
    );
  }
}

export default injectIntl(Header);
