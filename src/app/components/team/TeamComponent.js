import React, { Component } from 'react';
import PropTypes from 'prop-types';
import deepEqual from 'deep-equal';
import { FormattedMessage } from 'react-intl';
import { browserHistory } from 'react-router';
import { withStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import styled from 'styled-components';
import TeamBots from './TeamBots';
import TeamLanguages from './Languages';
import TeamRules from './Rules';
import TeamStatuses from './Statuses';
import TeamTags from './TeamTags';
import TeamTasks from './TeamTasks';
import TeamReport from './TeamReport';
import TeamInfo from './TeamInfo';
import TeamInfoEdit from './TeamInfoEdit';
import TeamMembers from './TeamMembers';
import TeamLists from './TeamLists';
import SlackConfig from './SlackConfig';
import HeaderCard from '../HeaderCard';
import PageTitle from '../PageTitle';
import { can } from '../Can';
import UserUtil from '../user/UserUtil';
import CheckContext from '../../CheckContext';
import {
  ContentColumn,
  backgroundMain,
  brandSecondary,
} from '../../styles/js/shared';

const styles = () => ({
  root: {
    maxWidth: '120px',
    minWidth: '120px',
  },
});

const StyledTabs = styled(Tabs)`
  background-color: ${brandSecondary};
  box-shadow: none !important;
`;

const StyledTeamContainer = styled.div`
  background-color: ${backgroundMain};
  min-height: 100vh;
`;

class TeamComponent extends Component {
  componentDidMount() {
    this.setContextTeam();
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !deepEqual(nextProps, this.props) || !deepEqual(nextState, this.state);
  }

  componentDidUpdate() {
    this.setContextTeam();
  }

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
    const path = `/${team.slug}/settings/${tab}`;
    browserHistory.push(path);
  };

  render() {
    const { team, classes } = this.props;
    const { action } = this.props.route;

    const isEditing = (action === 'edit') && can(team.permissions, 'update Team');
    const isSettings = (action === 'settings') && can(team.permissions, 'update Team');
    const isReadOnly = (action === 'settings') && can(team.permissions, 'read Team');

    const context = new CheckContext(this).getContextStore();

    const TeamPageContent = (
      <ContentColumn>
        <TeamMembers {...this.props} />
      </ContentColumn>
    );

    const HeaderContent = () => (
      <Box pt={3} pb={3}>
        { isEditing ?
          <TeamInfoEdit team={team} /> :
          <TeamInfo team={team} context={context} />
        }
      </Box>
    );

    const currentUserIsOwner = UserUtil.myRole(this.getCurrentUser(), this.props.team.slug) === 'owner';
    let { tab } = this.props.params;
    if (!tab) {
      tab = 'lists';
    }
    if (!currentUserIsOwner) {
      tab = 'tags';
    }

    const TeamSettingsTabs = () => {
      if (isSettings || isReadOnly) {
        return (
          <StyledTabs
            indicatorColor="primary"
            textColor="primary"
            value={tab}
            onChange={this.handleTabChange}
            centered
          >
            { currentUserIsOwner ?
              <Tab
                className="team-settings__lists-tab"
                classes={{ root: classes.root }}
                label={
                  <FormattedMessage
                    id="teamSettings.lists"
                    defaultMessage="Lists"
                  />
                }
                value="lists"
              /> : null
            }
            { currentUserIsOwner ?
              <Tab
                className="team-settings__metadata-tab"
                classes={{ root: classes.root }}
                label={
                  <FormattedMessage
                    id="teamSettings.metadata"
                    defaultMessage="Metadata"
                  />
                }
                value="metadata"
              /> : null
            }
            { currentUserIsOwner ?
              <Tab
                className="team-settings__tasks-tab"
                classes={{ root: classes.root }}
                label={
                  <FormattedMessage
                    id="teamSettings.tasks"
                    defaultMessage="Tasks"
                  />
                }
                value="tasks"
              /> : null
            }
            {currentUserIsOwner ?
              <Tab
                className="team-settings__rules-tab"
                classes={{ root: classes.root }}
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
                classes={{ root: classes.root }}
                label={
                  <FormattedMessage
                    id="teamSettings.Tags"
                    defaultMessage="Tags"
                  />
                }
                value="tags"
              /> : null }
            {currentUserIsOwner ?
              <Tab
                className="team-settings__languages-tab"
                classes={{ root: classes.root }}
                label={
                  <FormattedMessage
                    id="teamSettings.languages"
                    defaultMessage="Languages"
                  />
                }
                value="languages"
              />
              : null }
            {currentUserIsOwner ?
              <Tab
                className="team-settings__statuses-tab"
                classes={{ root: classes.root }}
                label={
                  <FormattedMessage
                    id="teamSettings.statuses"
                    defaultMessage="Statuses"
                  />
                }
                value="statuses"
              />
              : null }
            {currentUserIsOwner ?
              <Tab
                className="team-settings__report-tab"
                classes={{ root: classes.root }}
                label={
                  <FormattedMessage
                    id="teamSettings.report"
                    defaultMessage="Report"
                  />
                }
                value="report"
              />
              : null }
            {currentUserIsOwner ?
              <Tab
                className="team-settings__integrations-tab"
                classes={{ root: classes.root }}
                label={
                  <FormattedMessage
                    id="teamSettings.integrations"
                    defaultMessage="Integrations"
                  />
                }
                value="integrations"
              />
              : null }
            {currentUserIsOwner ?
              <Tab
                className="team-settings__bots-tab"
                classes={{ root: classes.root }}
                label={
                  <FormattedMessage
                    id="teamSettings.bots"
                    defaultMessage="Bots"
                  />
                }
                value="bots"
              />
              : null }
          </StyledTabs>
        );
      }

      return null;
    };

    return (
      <PageTitle team={team}>
        <StyledTeamContainer className="team">
          <HeaderCard>
            <ContentColumn>
              { isSettings ? null : <HeaderContent /> }
            </ContentColumn>
            <TeamSettingsTabs />
          </HeaderCard>
          { !isEditing && !isSettings && !isReadOnly ? TeamPageContent : null }
          { isSettings && tab === 'lists'
            ? <TeamLists key={tab} />
            : null }
          { isSettings && tab === 'metadata'
            ? <TeamTasks key={tab} team={team} fieldset="metadata" />
            : null }
          { isSettings && tab === 'tasks'
            ? <TeamTasks key={tab} team={team} fieldset="tasks" />
            : null }
          { isSettings && tab === 'bots'
            ? <TeamBots team={team} route={this.props.route} router={this.props.router} />
            : null }
          { isSettings && tab === 'rules'
            ? <TeamRules teamSlug={team.slug} />
            : null }
          { isSettings && tab === 'report'
            ? <TeamReport team={team} />
            : null }
          { isSettings && tab === 'integrations'
            ? (
              <ContentColumn>
                <SlackConfig team={team} />
              </ContentColumn>
            ) : null }
          { isReadOnly && tab === 'tags'
            ? <TeamTags team={team} />
            : null }
          { isSettings && tab === 'statuses'
            ? <TeamStatuses teamSlug={team.slug} />
            : null }
          { isSettings && tab === 'languages'
            ? <TeamLanguages teamSlug={team.slug} />
            : null }
        </StyledTeamContainer>
      </PageTitle>
    );
  }
}

TeamComponent.propTypes = {
  classes: PropTypes.object.isRequired,
};

TeamComponent.contextTypes = {
  store: PropTypes.object,
};

export default withStyles(styles)(TeamComponent);
