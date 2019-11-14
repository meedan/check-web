import React, { Component } from 'react';
import Relay from 'react-relay/classic';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Card, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import styled from 'styled-components';
import Form from 'react-jsonschema-form-material-ui';
import TeamRoute from '../../relay/TeamRoute';
import { units, ContentColumn, black32 } from '../../styles/js/shared';
import Message from '../Message';
import CardHeaderOutside from '../layout/CardHeaderOutside';
import UpdateTeamMutation from '../../relay/mutations/UpdateTeamMutation';

const StyledSchemaForm = styled.div`
  div {
    box-shadow: none !important;
  }

  fieldset > label + div div {
    padding-left: 0 !important;
    padding-right: 0 !important;
  }

  fieldset {
    border: 0;
    padding: 0;
  }

  button, fieldset > label {
    display: none;
  }

  div + fieldset {
    margin-top: ${units(1)};
  }

  fieldset fieldset fieldset {
    padding: ${units(1)};
    border: 1px solid ${black32};
    margin-bottom: ${units(1)} !important;
  }

  fieldset button {
    display: block !important;
    width: 160px !important;
  }

  fieldset button[class*="remove"] {
    border: 0 !important;
    width: 32px !important;
  }

  fieldset fieldset fieldset div[class*="input"] {
    max-width: 470px;
  }
  
  fieldset fieldset fieldset button[class*="remove"] {
    display: none !important;
  }
`;

class TeamRulesComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rules: props.team.get_rules || [],
      message: null,
    };
  }

  handleRulesUpdated(data) {
    const { rules } = data.formData;
    this.setState({ rules, message: null });
  }

  handleSubmitRules() {
    const onSuccess = () => {
      this.setState({
        message: <FormattedMessage id="teamRules.success" defaultMessage="Rules updated successfully!" />,
      });
    };
    const onFailure = () => {
      this.setState({
        message: <FormattedMessage id="teamRules.fail" defaultMessage="Error when trying to update rules." />,
      });
    };

    Relay.Store.commitUpdate(
      new UpdateTeamMutation({
        id: this.props.team.id,
        rules: JSON.stringify(this.state.rules),
      }),
      { onSuccess, onFailure },
    );
  }

  render() {
    const { team, direction } = this.props;

    return (
      <ContentColumn>
        <Message message={this.state.message} />
        <CardHeaderOutside
          direction={direction}
          title={<FormattedMessage id="teamRules.title" defaultMessage="Rules" />}
        />
        <Card style={{ marginTop: units(2), marginBottom: units(5) }}>
          <CardText>
            <StyledSchemaForm>
              <Form
                schema={team.rules_json_schema}
                formData={{ rules: this.state.rules }}
                onChange={this.handleRulesUpdated.bind(this)}
              />
              <p>
                <FlatButton
                  primary
                  onClick={this.handleSubmitRules.bind(this)}
                  label={
                    <FormattedMessage
                      id="teamRules.save"
                      defaultMessage="Save"
                    />
                  }
                />
              </p>
            </StyledSchemaForm>
          </CardText>
        </Card>
      </ContentColumn>
    );
  }
}

const TeamRulesContainer = Relay.createContainer(injectIntl(TeamRulesComponent), {
  fragments: {
    team: () => Relay.QL`
      fragment on Team {
        id
        dbid
        slug
        get_rules
        rules_json_schema
      }
    `,
  },
});

const TeamRules = (props) => {
  const route = new TeamRoute({ teamSlug: props.team.slug });
  const params = { propTeam: props.team, direction: props.direction };
  return (
    <Relay.RootContainer
      Component={TeamRulesContainer}
      route={route}
      renderFetched={data => <TeamRulesContainer {...data} {...params} />}
    />
  );
};

export default TeamRules;
