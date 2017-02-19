import React, { Component, PropTypes } from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import FlatButton from 'material-ui/FlatButton';
import TeamHeader from './team/TeamHeader';
import TeamPublicHeader from './team/TeamPublicHeader';
import ProjectHeader from './project/ProjectHeader';
import Breadcrumb from './layout/Breadcrumb';
import HeaderActions from './HeaderActions';
import Can from './Can';
import { Link } from 'react-router';

const messages = defineMessages({
  projectLabel: {
    id: 'header.projectLabel',
    defaultMessage: 'Project'
  },
  teamLabel: {
    id: 'header.teamLabel',
    defaultMessage: 'Team'
  },
  teamsLabel: {
    id: 'header.teamsLabel',
    defaultMessage: 'Teams'
  }
});

class Header extends Component {
  render() {
    const { state } = this.props;
    const path = this.props.location ? this.props.location.pathname : null;
    const { formatMessage } = this.props.intl;
    const showCheckLogo = /^\/(check(\/.*)?)?$/.test(path);

    const defaultHeader = (
      <header className="header header--default">
        <div className="header__container">
          { showCheckLogo ?
            (<Link to='/check/teams' className='header__app-link'><img src='/images/logo/check.svg' /></Link>) :
            (<div className="header__team"><TeamHeader {...this.props} /></div>)
          }
          <ProjectHeader {...this.props} />
          <HeaderActions {...this.props} />
        </div>
      </header>
    );

    return defaultHeader;
  }
}

Header.propTypes = {
  intl: intlShape.isRequired
};

export default injectIntl(Header);
