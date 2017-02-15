import React, { Component, PropTypes } from 'react';
import FlatButton from 'material-ui/FlatButton';
import TeamHeader from './team/TeamHeader';
import TeamPublicHeader from './team/TeamPublicHeader';
import ProjectHeader from './project/ProjectHeader';
import Breadcrumb from './layout/Breadcrumb';
import HeaderActions from './HeaderActions';
import Can from './Can';

class Header extends Component {
  render() {
    const { state } = this.props;
    const path = this.props.location ? this.props.location.pathname : null;

    const defaultHeader = (
      <header className="header header--default">
        <div className="header__container">
          <div className="header__breadcrumb"><Breadcrumb url="/check/teams" label={null} /></div>
          <HeaderActions {...this.props} />
        </div>
      </header>
    );

    if (!path) {
      return defaultHeader;
    }

    if (path.match(/media\/[0-9]+/)) {
      const projectUrl = path.match(/(.*)\/media\/[0-9]+/)[1];
      return (
        <header className="header header--media">
          <div className="header__container">
            <div className="header__team"><TeamHeader {...this.props} /></div>
            <div className="header__breadcrumb"><Breadcrumb url={projectUrl} label="Project" /></div>
            <HeaderActions {...this.props} />
          </div>
        </header>
      );
    }

    if (path.match(/project\/[0-9]+\/edit/)) {
      const projectUrl = path.match(/(.*)\/edit$/)[1];
      return (
        <header className="header header--project-edit">
          <div className="header__container">
            <div className="header__team"><TeamHeader {...this.props} /></div>
            <div className="header__breadcrumb"><Breadcrumb url={projectUrl} label="Project" /></div>
            <ProjectHeader {...this.props} />
            <HeaderActions {...this.props} />
          </div>
        </header>
      );
    }

    if (path.match(/project\/[0-9]+/)) {
      return (
        <header className="header header--project">
          <div className="header__container">
            <div className="header__team"><TeamHeader {...this.props} /></div>
            <ProjectHeader {...this.props} />
            <HeaderActions {...this.props} />
          </div>
        </header>
      );
    }

    if (path.match(/search\/?/)) {
      return (
        <header className="header header--default">
          <div className="header__container">
            <div className="header__team"><TeamHeader {...this.props} /></div>
            <div className="header__breadcrumb"><Breadcrumb url={`/${this.props.params.team}`} label={null} /></div>
            <HeaderActions {...this.props} />
          </div>
        </header>
      );
    }

    if (path.match(/\/members/)) {
      return (
        <header className="header header--team-subpage">
          <div className="header__container">
            <div className="header__team"><TeamHeader {...this.props} /></div>
            <div className="header__breadcrumb"><Breadcrumb url={`/${this.props.params.team}`} label="Team" /></div>
            <HeaderActions {...this.props} />
          </div>
        </header>
      );
    }

    if (path.match(/\/join/)) {
      return (
        <header className="header header--team-subpage">
          <div className="header__container">
            <TeamPublicHeader {...this.props} />
          </div>
        </header>
      );
    }

    if (path.match(/\/(teams\/new)?$/)) {
      return (
        <header className="header header--team">
          <div className="header__container">
            <div className="header__breadcrumb"><Breadcrumb url="/check/teams" label="Teams" /></div>
            <HeaderActions {...this.props} />
          </div>
        </header>
      );
    }

    return defaultHeader;
  }
}

export default Header;
