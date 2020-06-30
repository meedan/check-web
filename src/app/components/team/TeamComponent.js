import React, { Component } from 'react';
import PropTypes from 'prop-types';
import deepEqual from 'deep-equal';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { browserHistory } from 'react-router';
import { withStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import styled from 'styled-components';
import TeamBots from './TeamBots';
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
      showTab: props.params.tab,
      message: null,
    };
  }

  componentWillMount() {
    let { showTab } = this.state;

    if (!showTab) {
      showTab = UserUtil.myRole(this.getCurrentUser(), this.props.team.slug) === 'owner'
        ? 'tasks' : 'tags';
    }

    this.setState({ showTab });
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

  handleTabChange = (e, value) => {
    this.setState({ showTab: value });
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

    const TeamSettingsTabs = () => {
      if (isSettings || isReadOnly) {
        return (
          <Tabs
            indicatorColor="primary"
            textColor="primary"
            value={this.state.showTab}
            onChange={this.handleTabChange}
            centered
          >
            { UserUtil.myRole(this.getCurrentUser(), team.slug) === 'owner' ?
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
            {UserUtil.myRole(this.getCurrentUser(), team.slug) === 'owner' ?
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
            {UserUtil.myRole(this.getCurrentUser(), team.slug) === 'owner' ?
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
            {UserUtil.myRole(this.getCurrentUser(), team.slug) === 'owner' ?
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
            {UserUtil.myRole(this.getCurrentUser(), team.slug) === 'owner' ?
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
          { isSettings && this.state.showTab === 'tasks'
            ? <TeamTasks team={team} />
            : null }
          { isSettings && this.state.showTab === 'bots'
            ? <TeamBots team={team} />
            : null }
          { isSettings && this.state.showTab === 'rules'
            ? <TeamRules teamSlug={team.slug} />
            : null }
          { isSettings && this.state.showTab === 'report'
            ? <TeamReport team={team} />
            : null }
          { isSettings && this.state.showTab === 'integrations'
            ? (
              <ContentColumn>
                <SlackConfig team={team} />
              </ContentColumn>
            ) : null }
          { isReadOnly && this.state.showTab === 'tags'
            ? <TeamTags team={team} />
            : null }
          { isSettings && this.state.showTab === 'statuses'
            ? <TeamStatuses team={team} />
            : null }
        </div>
      </PageTitle>
    );
  }
}

TeamComponent.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  intl: intlShape.isRequired,
  classes: PropTypes.object.isRequired,
};

TeamComponent.contextTypes = {
  store: PropTypes.object,
};

export default withStyles(styles)(injectIntl(TeamComponent));
