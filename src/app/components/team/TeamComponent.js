import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import TextField from 'material-ui/TextField';
import rtlDetect from 'rtl-detect';
import styled from 'styled-components';
import TeamInfo from './TeamInfo';
import TeamInfoEdit from './TeamInfoEdit';
import TeamMembers from './TeamMembers';
import TeamProjects from './TeamProjects';
import HeaderCard from '../HeaderCard';
import PageTitle from '../PageTitle';
import UpdateTeamMutation from '../../relay/mutations/UpdateTeamMutation';
import Message from '../Message';
import { can } from '../Can';
import CheckContext from '../../CheckContext';
import { safelyParseJSON } from '../../helpers';
import {
  ContentColumn,
  units,
  mediaQuery,
} from '../../styles/js/shared';

const messages = defineMessages({
  editError: {
    id: 'teamComponent.editError',
    defaultMessage: 'Sorry, could not edit the team',
  },
  editSuccess: {
    id: 'teamComponent.editSuccess',
    defaultMessage: 'Team information updated successfully!',
  },
  teamName: {
    id: 'teamComponent.teamName',
    defaultMessage: 'Team name',
  },
  teamDescription: {
    id: 'teamComponent.teamDescription',
    defaultMessage: 'Team description',
  },
  location: {
    id: 'teamComponent.location',
    defaultMessage: 'Location',
  },
  phone: {
    id: 'teamComponent.phone',
    defaultMessage: 'Phone number',
  },
  website: {
    id: 'teamComponent.website',
    defaultMessage: 'Website',
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

    const { team } = this.props;
    const contact = team.contacts.edges[0] || { node: {} };
    this.state = {
      message: null,
      isEditing: false,
      editProfileImg: false,
      submitDisabled: false,
      values: {
        name: team.name,
        description: team.description,
        contact_location: contact.node.location,
        contact_phone: contact.node.phone,
        contact_web: contact.node.web,
      },
    };
  }

  componentDidMount() {
    this.setContextTeam();
  }

  componentDidUpdate() {
    this.setContextTeam();
  }

  onImage(file) {
    document.forms['edit-team-form'].avatar = file;
    this.setState({ message: null, avatar: file });
  }

  onClear() {
    if (document.forms['edit-team-form']) {
      document.forms['edit-team-form'].avatar = null;
    }
    this.setState({ message: null, avatar: null });
  }

  onImageError(file, message) {
    this.setState({ message, avatar: null });
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

  cancelEditTeam(e) {
    e.preventDefault();
    this.setState({ avatar: null, isEditing: false });
  }

  handleEditTeam() {
    const onFailure = (transaction) => {
      const error = transaction.getError();
      let message = this.props.intl.formatMessage(messages.editError);
      const json = safelyParseJSON(error.source);
      if (json && json.error) {
        message = json.error;
      }
      return this.setState({ message, avatar: null, submitDisabled: false });
    };

    const onSuccess = () => {
      this.setState({
        message: this.props.intl.formatMessage(messages.editSuccess),
        avatar: null,
        isEditing: false,
        submitDisabled: false,
      });
    };

    const { values } = this.state;
    const form = document.forms['edit-team-form'];

    if (!this.state.submitDisabled) {
      Relay.Store.commitUpdate(
        new UpdateTeamMutation({
          name: values.name,
          description: values.description,
          contact: JSON.stringify({
            location: values.contact_location,
            phone: values.contact_phone,
            web: values.contact_web,
          }),
          id: this.props.team.id,
          public_id: this.props.team.public_team_id,
          avatar: form.avatar,
        }),
        { onSuccess, onFailure },
      );
      this.setState({ submitDisabled: true });
    }
  }

  handleEditProfileImg() {
    this.setState({ editProfileImg: true });
  }

  handleEnterEditMode(e) {
    this.setState({ isEditing: true, editProfileImg: false });
    e.preventDefault();
  }

  handleChange(key, e) {
    const value = (e.target.type === 'checkbox' && !e.target.checked) ? '0' : e.target.value;
    const values = Object.assign({}, this.state.values);
    values[key] = value;
    this.setState({ values });
  }

  render() {
    const { team } = this.props;
    const { isEditing } = this.state;
    const contact = team.contacts.edges[0];

    const isRtl = rtlDetect.isRtlLang(this.props.intl.locale);

    const direction = {
      from: isRtl ? 'right' : 'left',
      to: isRtl ? 'left' : 'right',
    };

    const avatarPreview = this.state.avatar && this.state.avatar.preview;
    const context = new CheckContext(this).getContextStore();

    return (
      <PageTitle prefix={false} skipTeam={false} team={team}>
        <div className="team">
          <HeaderCard
            canEdit={can(team.permissions, 'update Team')}
            direction={direction}
            handleEnterEditMode={this.handleEnterEditMode.bind(this)}
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
