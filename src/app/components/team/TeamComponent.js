import React, { Component } from 'react';
import PropTypes from 'prop-types';
import deepEqual from 'deep-equal';
import { FormattedMessage } from 'react-intl';
import { browserHistory } from 'react-router';
import { withStyles } from '@material-ui/core/styles';
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
import TeamProjects from './TeamProjects';
import SlackConfig from './SlackConfig';
import HeaderCard from '../HeaderCard';
import PageTitle from '../PageTitle';
import Message from '../Message';
import { can } from '../Can';
import UserUtil from '../user/UserUtil';
import CheckContext from '../../CheckContext';
import {
  ContentColumn,
  units,
  mediaQuery,
} from '../../styles/js/shared';

const styles = () => ({
  root: {
    maxWidth: '120px',
    minWidth: '120px',
  },
});

const StyledTwoColumnLayout = styled(ContentColumn)`
  flex-direction: column;
  ${mediaQuery.desktop`
    display: flex;
    justify-content: center;
    max-width: ${units(120)};
    padding: 0;
    flex-direction: row;

    .team__primary-column {
      max-width: ${units(150)} !important;
    }

    .team__secondary-column {
      max-width: ${units(50)};
    }
  `}
`;

class TeamComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      message: null,
    };
  }

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
      <StyledTwoColumnLayout>
        <ContentColumn>
          <TeamMembers {...this.props} />
        </ContentColumn>
        <ContentColumn className="team__secondary-column">
          <TeamProjects team={team} relay={this.props.relay} />
        </ContentColumn>
      </StyledTwoColumnLayout>
    );

    const HeaderContent = () => {
      if (isEditing) {
        return <TeamInfoEdit team={team} />;
      }

      return <TeamInfo team={team} context={context} />;
    };

    const currentUserIsOwner = UserUtil.myRole(this.getCurrentUser(), this.props.team.slug) === 'owner';
    let { tab } = this.props.params;
    if (!tab || !currentUserIsOwner) {
      tab = 'tags';
    }

    const TeamSettingsTabs = () => {
      if (isSettings || isReadOnly) {
        return (
          <Tabs
            indicatorColor="primary"
            textColor="primary"
            value={tab}
            onChange={this.handleTabChange}
            centered
          >
            { currentUserIsOwner ?
              <Tab
                className="team-settings__tasks-tab"
                classes={{ root: classes.root }}
                label={
                  <FormattedMessage
                    id="teamSettings.Tasks"
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
            {UserUtil.myRole(this.getCurrentUser(), team.slug) === 'owner' ?
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
          </Tabs>
        );
      }

      return null;
    };

    return (
      <PageTitle team={team}>
        <div className="team">
          <HeaderCard>
            <ContentColumn>
              <Message message={this.state.message} />
              <HeaderContent />
            </ContentColumn>
            <TeamSettingsTabs />
          </HeaderCard>
          { !isEditing && !isSettings && !isReadOnly ? TeamPageContent : null }
          { isSettings && tab === 'tasks'
            ? <TeamTasks team={team} />
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
          { isSettings && this.state.showTab === 'languages'
            ? <TeamLanguages teamSlug={team.slug} />
            : null }
        </div>
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
