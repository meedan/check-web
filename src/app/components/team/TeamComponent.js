/* eslint-disable relay/unused-fields, react/sort-prop-types */
import React, { Component } from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import PropTypes from 'prop-types';
import deepEqual from 'deep-equal';
import { browserHistory } from 'react-router';
import cx from 'classnames/bind';
import TeamDetails from './TeamDetails';
import TeamLanguages from './Languages';
import TeamRules from './Rules';
import TeamStatuses from './Statuses';
import SmoochBot from './SmoochBot';
import TeamTags from './TeamTags';
import TeamTasks from './TeamTasks';
import TeamReport from './TeamReport';
import TeamMembers from './TeamMembers';
import TeamIntegrations from './TeamIntegrations';
import TeamSimilarity from './Similarity';
import Newsletter from './Newsletter';
import PageTitle from '../PageTitle';
import UserUtil from '../user/UserUtil';
import CheckContext from '../../CheckContext';
import styles from './Settings.module.css';

class TeamComponent extends Component {
  // FIXME Is this still needed?
  componentDidMount() {
    this.setContextTeam();
  }

  // FIXME Is this still needed?
  shouldComponentUpdate(nextProps) {
    return !deepEqual(nextProps, this.props);
  }

  // FIXME Is this still needed?
  componentDidUpdate() {
    this.setContextTeam();
  }

  // FIXME Is this still needed?
  setContextTeam() {
    const context = new CheckContext(this);
    const store = context.getContextStore();
    const { team } = this.props;

    if (!store.team || store.team.slug !== team.slug) {
      context.setContextStore({ team });
      const path = `/${team.slug}/settings`;
      browserHistory.push(path);
    }
  }

  getCurrentUser() {
    return new CheckContext(this).getContextStore().currentUser;
  }

  render() {
    const { team } = this.props;

    const userRole = UserUtil.myRole(this.getCurrentUser(), this.props.team.slug);
    const isAdminOrEditor = userRole === 'admin' || userRole === 'editor';

    let { tab } = this.props.params;

    if (!tab) {
      tab = !isAdminOrEditor ? 'tags' : 'workspace';
      browserHistory.push(`/${team.slug}/settings/${tab}`);
    }

    return (
      <PageTitle team={team}>
        <div className={cx('team', styles['settings-wrapper'])}>
          <div className={cx(styles['settings-content'])}>
            { tab === 'workspace'
              ? <TeamDetails team={team} />
              : null }
            { tab === 'members'
              ? <TeamMembers teamSlug={team.slug} />
              : null }
            { tab === 'annotation'
              ? <TeamTasks fieldset="metadata" key={tab} team={team} />
              : null }
            { tab === 'tipline'
              ? <SmoochBot currentUser={this.getCurrentUser()} />
              : null }
            { tab === 'newsletter'
              ? <Newsletter />
              : null }
            { tab === 'rules'
              ? <TeamRules teamSlug={team.slug} />
              : null }
            { tab === 'report'
              ? <TeamReport team={team} />
              : null }
            { tab === 'integrations'
              ? <TeamIntegrations />
              : null }
            { tab === 'tags'
              ? <TeamTags teamSlug={team.slug} />
              : null }
            { tab === 'statuses'
              ? <TeamStatuses teamSlug={team.slug} />
              : null }
            { tab === 'languages'
              ? <TeamLanguages teamSlug={team.slug} />
              : null }
            { tab === 'similarity'
              ? <TeamSimilarity teamSlug={team.slug} />
              : null }
          </div>
        </div>
      </PageTitle>
    );
  }
}

TeamComponent.propTypes = {
  team: PropTypes.shape({
    name: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    permissions: PropTypes.string.isRequired,
  }).isRequired,
  params: PropTypes.shape({
    tab: PropTypes.string.isRequired,
  }).isRequired,
};

TeamComponent.contextTypes = {
  store: PropTypes.object,
};

export default createFragmentContainer(TeamComponent, {
  team: graphql`
    fragment TeamComponent_team on Team {
      id
      dbid
      name
      slug
      permissions
      ...TeamDetails_team
      alegre_bot: team_bot_installation(bot_identifier: "alegre") {
        id
      }
      smooch_bot: team_bot_installation(bot_identifier: "smooch") {
        id
      }
    }
  `,
});
