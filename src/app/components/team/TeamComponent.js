import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import rtlDetect from 'rtl-detect';
import styled from 'styled-components';
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

    this.state = {
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

  render() {
    const { team } = this.props;
    const isEditing = this.props.route.isEditing && can(team.permissions, 'update Team');

    const isRtl = rtlDetect.isRtlLang(this.props.intl.locale);

    const direction = {
      from: isRtl ? 'right' : 'left',
      to: isRtl ? 'left' : 'right',
    };

    const context = new CheckContext(this).getContextStore();

    return (
      <PageTitle prefix={false} skipTeam={false} team={team}>
        <div className="team">
          <HeaderCard
            direction={direction}
            isEditing={isEditing}
          >
            <ContentColumn>
              <Message message={this.state.message} />
              { isEditing ?
                <TeamInfoEdit team={team} /> :
                <TeamInfo team={team} context={context} />
              }
            </ContentColumn>
          </HeaderCard>
          { isEditing ?
            null :
            <StyledTwoColumnLayout>
              <ContentColumn>
                <TeamMembers {...this.props} />
              </ContentColumn>
              <ContentColumn className="team__secondary-column">
                <TeamProjects team={team} relay={this.props.relay} />
                <SlackConfig team={team} />
              </ContentColumn>
            </StyledTwoColumnLayout>
          }
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
