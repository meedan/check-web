import React, { Component } from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import PropTypes from 'prop-types';
import deepEqual from 'deep-equal';
import { FormattedMessage } from 'react-intl';
import { browserHistory } from 'react-router';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import styled from 'styled-components';
import TeamDetails from './TeamDetails';
import TeamLanguages from './Languages';
import TeamRules from './Rules';
import TeamStatuses from './Statuses';
import SmoochBot from './SmoochBot';
import TeamTags from './TeamTags';
import TeamData from './TeamData';
import TeamTasks from './TeamTasks';
import TeamReport from './TeamReport';
import TeamMembers from './TeamMembers';
import TeamLists from './TeamLists';
import TeamIntegrations from './TeamIntegrations';
import TeamSimilarity from './Similarity';
import PageTitle from '../PageTitle';
import { can } from '../Can';
import UserUtil from '../user/UserUtil';
import CheckContext from '../../CheckContext';
import { backgroundMain, brandSecondary } from '../../styles/js/shared';

const StyledTabs = styled(Tabs)`
  background-color: ${brandSecondary};
  box-shadow: none !important;
  padding-left: 32px;
  margin-bottom: 32px;
`;

const StyledTeamContainer = styled.div`
  background-color: ${backgroundMain};
  min-height: 100vh;
`;

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
      const path = `/${team.slug}`;
      browserHistory.push(path);
    }
  }

  getCurrentUser() {
    return new CheckContext(this).getContextStore().currentUser;
  }

  handleTabChange = (e, tab) => {
    const { team } = this.props;
    const path = tab === 'members' || tab === 'edit' ?
      `/${team.slug}/${tab}` :
      `/${team.slug}/settings/${tab}`;
    browserHistory.push(path);
  };

  render() {
    const { team } = this.props;
    const { action } = this.props.route;
    const isSettings = (action === 'settings') && can(team.permissions, 'update Team');
    const isReadOnly = (action === 'settings') && can(team.permissions, 'read Team');

    const userRole = UserUtil.myRole(this.getCurrentUser(), this.props.team.slug);
    const isAdmin = userRole === 'admin';
    const isAdminOrEditor = userRole === 'admin' || userRole === 'editor';
    const isAlegreBotInstalled = Boolean(team.alegre_bot);

    let { tab } = this.props.params;

    if (!tab) {
      tab = 'lists';

      if (action === 'main') {
        tab = 'members';
      } else if (!isAdminOrEditor) {
        tab = 'tags';
      }
    }

    const TeamSettingsTabs = () => {
      if (isSettings || isReadOnly) {
        return (
          <StyledTabs
            indicatorColor="primary"
            textColor="primary"
            value={tab}
            onChange={this.handleTabChange}
          >
            { isAdminOrEditor ?
              <Tab
                className="team-settings__lists-tab"
                label={
                  <FormattedMessage
                    id="teamSettings.lists"
                    defaultMessage="Columns"
                  />
                }
                value="lists"
              /> : null
            }
            { can(team.permissions, 'mange TeamTask') ?
              <Tab
                className="team-settings__metadata-tab"
                label={
                  <FormattedMessage
                    id="teamSettings.metadata"
                    defaultMessage="Metadata"
                  />
                }
                value="metadata"
              /> : null
            }
            {isAdminOrEditor ?
              <Tab
                className="team-settings__tipline-tab"
                label={
                  <FormattedMessage
                    id="teamSettings.tipline"
                    defaultMessage="Tipline"
                  />
                }
                value="tipline"
              />
              : null }
            {isAdminOrEditor ?
              <Tab
                className="team-settings__data-tab"
                label={
                  <FormattedMessage
                    id="teamSettings.data"
                    defaultMessage="Data"
                  />
                }
                value="data"
              />
              : null }
            { can(team.permissions, 'mange TeamTask') ?
              <Tab
                className="team-settings__tasks-tab"
                label={
                  <FormattedMessage
                    id="teamSettings.tasks"
                    defaultMessage="Tasks"
                  />
                }
                value="tasks"
              /> : null
            }
            {isAdminOrEditor ?
              <Tab
                className="team-settings__rules-tab"
                label={
                  <FormattedMessage
                    id="teamSettings.rules"
                    defaultMessage="Rules"
                  />
                }
                value="rules"
              />
              : null }
            { isSettings || isReadOnly ?
              <Tab
                className="team-settings__tags-tab"
                label={
                  <FormattedMessage
                    id="teamSettings.Tags"
                    defaultMessage="Tags"
                  />
                }
                value="tags"
              /> : null }
            {isAdmin && isAlegreBotInstalled ?
              <Tab
                className="team-settings__similarity-tab"
                label={
                  <FormattedMessage
                    id="teamSettings.similarity"
                    defaultMessage="Similarity"
                  />
                }
                value="similarity"
              />
              : null }
            {isAdmin ?
              <Tab
                className="team-settings__languages-tab"
                label={
                  <FormattedMessage
                    id="teamSettings.languages"
                    defaultMessage="Languages"
                  />
                }
                value="languages"
              />
              : null }
            {isAdminOrEditor ?
              <Tab
                className="team-settings__statuses-tab"
                label={
                  <FormattedMessage
                    id="teamSettings.statuses"
                    defaultMessage="Statuses"
                  />
                }
                value="statuses"
              />
              : null }
            {isAdminOrEditor ?
              <Tab
                className="team-settings__report-tab"
                label={
                  <FormattedMessage
                    id="teamSettings.report"
                    defaultMessage="Report"
                  />
                }
                value="report"
              />
              : null }
            {isAdmin ?
              <Tab
                className="team-settings__integrations-tab"
                label={
                  <FormattedMessage
                    id="teamSettings.integrations"
                    defaultMessage="Integrations"
                  />
                }
                value="integrations"
              />
              : null }
          </StyledTabs>
        );
      }

      return (
        <StyledTabs
          indicatorColor="primary"
          textColor="primary"
          value={tab}
          onChange={this.handleTabChange}
        >
          <Tab
            className="team-settings__members-tab"
            label={
              <FormattedMessage
                id="teamSettings.members"
                defaultMessage="Members"
              />
            }
            value="members"
          />
          <Tab
            className="team-settings__details-tab"
            label={
              <FormattedMessage
                id="teamSettings.details"
                defaultMessage="Workspace details"
              />
            }
            value="edit"
          />
        </StyledTabs>
      );
    };

    return (
      <PageTitle team={team}>
        <StyledTeamContainer className="team">
          <TeamSettingsTabs />
          { tab === 'members'
            ? <TeamMembers teamSlug={team.slug} />
            : null }
          { tab === 'edit'
            ? <TeamDetails team={team} />
            : null }
          { isSettings && tab === 'lists'
            ? <TeamLists key={tab} />
            : null }
          { isSettings && tab === 'metadata'
            ? <TeamTasks key={tab} team={team} fieldset="metadata" />
            : null }
          { isSettings && tab === 'tipline'
            ? <SmoochBot currentUser={this.getCurrentUser()} />
            : null }
          { isSettings && tab === 'data'
            ? <TeamData teamSlug={team.slug} />
            : null }
          { isSettings && tab === 'tasks'
            ? <TeamTasks key={tab} team={team} fieldset="tasks" />
            : null }
          { isSettings && tab === 'rules'
            ? <TeamRules teamSlug={team.slug} />
            : null }
          { isSettings && tab === 'report'
            ? <TeamReport team={team} />
            : null }
          { isSettings && tab === 'integrations'
            ? <TeamIntegrations />
            : null }
          { isReadOnly && tab === 'tags'
            ? <TeamTags teamSlug={team.slug} />
            : null }
          { isSettings && tab === 'statuses'
            ? <TeamStatuses teamSlug={team.slug} />
            : null }
          { isSettings && tab === 'languages'
            ? <TeamLanguages teamSlug={team.slug} />
            : null }
          { isSettings && tab === 'similarity'
            ? <TeamSimilarity teamSlug={team.slug} />
            : null }
        </StyledTeamContainer>
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
  // TODO: Specify prop shapes
  route: PropTypes.object.isRequired,
  // TODO: Specify prop shapes
  params: PropTypes.object.isRequired,
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
    }
  `,
});
