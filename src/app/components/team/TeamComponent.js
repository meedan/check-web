/* eslint-disable relay/unused-fields */
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
import Newsletter from './Newsletter';
import PageTitle from '../PageTitle';
import { can } from '../Can';
import UserUtil from '../user/UserUtil';
import CheckContext from '../../CheckContext';
import { units } from '../../styles/js/shared';
import styles from './Settings.module.css';

const StyledTeamContainer = styled.div`
  background-color: var(--grayBackground);
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const StyledTabs = styled(Tabs)`
  background-color: var(--brandBackground);
  border-bottom: solid 1px var(--grayBorderMain);
  box-shadow: none !important;
  padding-left: 32px;
  flex: 0 0 48px;
`;

const StyledTeamContent = styled.div`
  flex: 1 1 auto;
  overflow: auto;
  padding: ${units(2)} 0;
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
      const path = `/${team.slug}/settings`;
      browserHistory.push(path);
    }
  }

  getCurrentUser() {
    return new CheckContext(this).getContextStore().currentUser;
  }

  handleTabChange = (e, tab) => {
    const { team } = this.props;
    const path = `/${team.slug}/settings/${tab}`;
    browserHistory.push(path);
  };

  render() {
    const { team } = this.props;

    const userRole = UserUtil.myRole(this.getCurrentUser(), this.props.team.slug);
    const isAdmin = userRole === 'admin';
    const isAdminOrEditor = userRole === 'admin' || userRole === 'editor';
    const isAlegreBotInstalled = Boolean(team.alegre_bot);

    let { tab } = this.props.params;

    if (!tab) {
      tab = !isAdminOrEditor ? 'tags' : 'workspace';
      browserHistory.push(`/${team.slug}/settings/${tab}`);
    }

    return (
      <PageTitle team={team}>
        <div className={styles['settings-wrapper']}>
          <StyledTeamContainer className="team">
            <StyledTabs
              indicatorColor="primary"
              textColor="primary"
              value={tab}
              onChange={this.handleTabChange}
            >
              <Tab
                className="team-settings__workspace-tab"
                label={
                  <FormattedMessage
                    id="teamSettings.workspace"
                    defaultMessage="Workspace"
                    description="Label for the Workspace settings tab"
                  />
                }
                value="workspace"
              />
              <Tab
                className="team-settings__members-tab"
                label={
                  <FormattedMessage
                    id="teamSettings.members"
                    defaultMessage="Members"
                    description="Label for the Members settings tab"
                  />
                }
                value="members"
              />
              { isAdminOrEditor ?
                <Tab
                  className="team-settings__lists-tab"
                  label={
                    <FormattedMessage
                      id="teamSettings.lists"
                      defaultMessage="Columns"
                      description="Label for the Columns settings tab"
                    />
                  }
                  value="columns"
                /> : null
              }
              { can(team.permissions, 'manage TeamTask') ?
                <Tab
                  className="team-settings__metadata-tab"
                  label={
                    <FormattedMessage
                      id="teamSettings.metadata"
                      defaultMessage="Annotation"
                      description="Label for annotation settings tab"
                    />
                  }
                  value="annotation"
                /> : null
              }
              {isAdminOrEditor ?
                <Tab
                  className="team-settings__tipline-tab"
                  label={
                    <FormattedMessage
                      id="teamSettings.tipline"
                      defaultMessage="Tipline"
                      description="Label for the Tipline settings tab"
                    />
                  }
                  value="tipline"
                />
                : null }
              {isAdminOrEditor ?
                <Tab
                  className="team-settings__newsletter-tab"
                  label={
                    <FormattedMessage
                      id="teamSettings.newsletter"
                      defaultMessage="Newsletter"
                      description="Label for a tab that takes the user to settings for their newsletter."
                    />
                  }
                  value="newsletter"
                />
                : null }
              {isAdminOrEditor && Boolean(team.smooch_bot) ?
                <Tab
                  className="team-settings__data-tab"
                  label={
                    <FormattedMessage
                      id="teamSettings.data"
                      defaultMessage="Data"
                      description="Label for the Data settings tab"
                    />
                  }
                  value="data"
                />
                : null }
              {isAdminOrEditor ?
                <Tab
                  className="team-settings__rules-tab"
                  label={
                    <FormattedMessage
                      id="teamSettings.rules"
                      defaultMessage="Rules"
                      description="Label for the Rules settings tab"
                    />
                  }
                  value="rules"
                />
                : null }
              { isAdminOrEditor ?
                <Tab
                  className="team-settings__tags-tab"
                  label={
                    <FormattedMessage
                      id="teamSettings.Tags"
                      defaultMessage="Tags"
                      description="Label for the Tags settings tab"
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
                      description="Label for the Similarity settings tab"
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
                      defaultMessage="Language"
                      description="Label for the Language settings tab"
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
                      description="Label for the Statuses settings tab"
                    />
                  }
                  value="statuses"
                />
                : null }
              {isAdminOrEditor && Boolean(team.smooch_bot) ?
                <Tab
                  className="team-settings__report-tab"
                  label={
                    <FormattedMessage
                      id="teamSettings.report"
                      defaultMessage="Report"
                      description="Label for the Report settings tab"
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
                      description="Label for the Integrations settings tab"
                    />
                  }
                  value="integrations"
                />
                : null }
            </StyledTabs>
            <StyledTeamContent>
              { tab === 'workspace'
                ? <TeamDetails team={team} />
                : null }
              { tab === 'members'
                ? <TeamMembers teamSlug={team.slug} />
                : null }
              { tab === 'columns'
                ? <TeamLists key={tab} />
                : null }
              { tab === 'annotation'
                ? <TeamTasks key={tab} team={team} fieldset="metadata" />
                : null }
              { tab === 'tipline'
                ? <SmoochBot currentUser={this.getCurrentUser()} />
                : null }
              { tab === 'newsletter'
                ? <Newsletter />
                : null }
              { tab === 'data'
                ? <TeamData teamSlug={team.slug} />
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
            </StyledTeamContent>
          </StyledTeamContainer>
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

// eslint-disable-next-line import/no-unused-modules
export { TeamComponent as TeamComponentTest };

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
