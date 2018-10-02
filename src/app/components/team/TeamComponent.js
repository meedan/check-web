import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import rtlDetect from 'rtl-detect';
import { Tabs, Tab } from 'material-ui/Tabs';
import styled from 'styled-components';
import TeamBots from './TeamBots';
import TeamTags from './TeamTags';
import TeamInfo from './TeamInfo';
import TeamInfoEdit from './TeamInfoEdit';
import TeamMembers from './TeamMembers';
import TeamProjects from './TeamProjects';
import SlackConfig from './SlackConfig';
import HeaderCard from '../HeaderCard';
import PageTitle from '../PageTitle';
import Message from '../Message';
import { can } from '../Can';
import CheckContext from '../../CheckContext';
import {
  ContentColumn,
  units,
  mediaQuery,
} from '../../styles/js/shared';

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

    const showTab = can(props.team.permissions, 'update Team') ? 'bots' : 'tags';

    this.state = {
      showTab,
      message: null,
    };
  }

  componentDidMount() {
    this.setContextTeam();
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
      store.history.push(path);
    }
  }

  handleTabChange = value => this.setState({ showTab: value });

  render() {
    const { team } = this.props;
    const { action } = this.props.route;

    const isEditing = (action === 'edit') && can(team.permissions, 'update Team');
    const isSettings = (action === 'settings') && can(team.permissions, 'update Team');
    const isReadOnly = (action === 'settings') && can(team.permissions, 'read Team');

    const isRtl = rtlDetect.isRtlLang(this.props.intl.locale);

    const direction = {
      from: isRtl ? 'right' : 'left',
      to: isRtl ? 'left' : 'right',
    };

    const context = new CheckContext(this).getContextStore();

    const TeamPageContent = () => (
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
          <Tabs value={this.state.showTab} onChange={this.handleTabChange}>
            { isSettings || isReadOnly ? <Tab
              className="team-settings__tags-tab"
              label={
                <FormattedMessage
                  id="teamSettings.Tags"
                  defaultMessage="Tags"
                />
              }
              value="tags"
            /> : null }
            { isSettings ? <Tab
              className="team-settings__integrations-tab"
              label={
                <FormattedMessage
                  id="teamSettings.integrations"
                  defaultMessage="Integrations"
                />
              }
              value="integrations"
            /> : null }
            { isSettings ? <Tab
              className="team-settings__bots-tab"
              label={
                <FormattedMessage
                  id="teamSettings.bots"
                  defaultMessage="Bots"
                />
              }
              value="bots"
            /> : null }
          </Tabs>
        );
      }

      return null;
    };

    return (
      <PageTitle prefix={false} skipTeam={false} team={team}>
        <div className="team">
          <HeaderCard direction={direction} isEditing={isEditing}>
            <ContentColumn>
              <Message message={this.state.message} />
              <HeaderContent />
              <TeamSettingsTabs />
            </ContentColumn>
          </HeaderCard>
          { !isEditing && !isSettings && !isReadOnly ? <TeamPageContent /> : null }
          { isSettings && this.state.showTab === 'bots'
            ? <TeamBots team={team} direction={direction} />
            : null }
          { isSettings && this.state.showTab === 'integrations'
            ? (
              <ContentColumn>
                <SlackConfig team={team} />
              </ContentColumn>
            ) : null }
          { isReadOnly && this.state.showTab === 'tags'
            ? <TeamTags team={team} direction={direction} />
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
};

TeamComponent.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(TeamComponent);
