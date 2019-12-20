import React, { Component } from 'react';
import Relay from 'react-relay/classic';
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl';
import { Card, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import { List, ListItem } from 'material-ui/List';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import IconButton from '@material-ui/core/IconButton';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import styled from 'styled-components';
import Form from 'react-jsonschema-form-material-ui';
import TeamRoute from '../../relay/TeamRoute';
import { units, ContentColumn } from '../../styles/js/shared';
import Message from '../Message';
import CardHeaderOutside from '../layout/CardHeaderOutside';
import UpdateTeamMutation from '../../relay/mutations/UpdateTeamMutation';

const messages = defineMessages({
  labelAnd: {
    id: 'teamRules.and',
    defaultMessage: '+ AND',
  },
  labelIf: {
    id: 'teamRules.if',
    defaultMessage: 'IF',
  },
  labelThen: {
    id: 'teamRules.then',
    defaultMessage: 'THEN',
  },
  addRule: {
    id: 'teamRules.newRule',
    defaultMessage: '+ RULE',
  },
});

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
  
  // All Actions fieldset and all rules fieldset
  fieldset fieldset fieldset div + fieldset > div::before,
  fieldset fieldset fieldset div + fieldset + fieldset > div::before {
    content: "${props => props.intl.formatMessage(messages.labelIf)}";
    display: block;
    text-transform: uppercase;
    font-weight: bold;
    font-size: 1rem;
  }
  fieldset fieldset fieldset div + fieldset,
  fieldset fieldset fieldset div + fieldset + fieldset {
    border-radius: 5px;
    border: 2px solid transparent;
  }
  fieldset fieldset fieldset div + fieldset > div::before {
    color: #FFAE53;
  }
  fieldset fieldset fieldset div + fieldset {
    border-color: #FFAE53;
  }
  fieldset fieldset fieldset div + fieldset + fieldset {
    border-color: #8173FF;
  }
  fieldset fieldset fieldset div + fieldset + fieldset > div::before {
    content: "${props => props.intl.formatMessage(messages.labelThen)}";
    color: #8173FF;
  }

  fieldset fieldset fieldset {
    padding: ${units(1)};
    margin-bottom: ${units(1)} !important;
  }

  fieldset fieldset fieldset div + fieldset fieldset,
  fieldset fieldset fieldset div + fieldset + fieldset fieldset {
    border-radius: 5px;
    border: 2px solid #CBCBCB;
  }

  fieldset button {
    display: block !important;
    background: transparent !important;
    text-transform: uppercase;
    font-weight: bold;
    color: #ACACAC;
    width: auto !important;
    font-size: 1rem;
  }

  fieldset button span {
    display: none;
  }
  
  fieldset button::before {
    content: "${props => props.intl.formatMessage(messages.addRule)}";
  }

  fieldset fieldset fieldset button::before {
    content: "${props => props.intl.formatMessage(messages.labelAnd)}";
  }

  fieldset fieldset + div > button {
    border: 0 !important;
    width: 32px !important;
  }

  fieldset fieldset fieldset fieldset + div > button {
    display: none !important;
  }

  // All Actions fieldset
  fieldset fieldset fieldset fieldset + fieldset {
  }

  // Each Action fieldset
  fieldset fieldset fieldset fieldset + fieldset fieldset {
  }

  // Each Action "action_value" div
  fieldset fieldset fieldset fieldset + fieldset fieldset > div > div + div {
    display: none;
  }
  
  fieldset fieldset fieldset div + fieldset fieldset > div > div + div > label + div,
  fieldset fieldset fieldset fieldset + fieldset fieldset > div > div + div > label + div {
    width: 100%;
  }

  // Each Rule "rule_value" div
  fieldset fieldset fieldset div + fieldset fieldset > div > div + div {
    display: none;
  }

  // Each rule div
  #rules > div > div + fieldset > div > fieldset > label + div > div > div {
    border: 0;
  }
  
  // Button to delete a whole rule
  #rules > div > div + fieldset > div > fieldset > label + div > div > div > fieldset + div {
    display: none;
  }
`;

class TeamRulesComponent extends Component {
  constructor(props) {
    super(props);
    const rules = props.team.get_rules || [];
    this.state = {
      rules,
      schema: JSON.parse(props.team.rules_json_schema),
      message: null,
      currentRuleIndex: rules.length,
      anchorEl: null,
      menuIndex: null,
    };
  }

  componentDidMount() {
    this.showDependentFields();
    this.toggleRulesForms();
  }

  componentDidUpdate() {
    this.showDependentFields();
    this.toggleRulesForms();
  }

  toggleRulesForms() {
    const rulesDivs = document.querySelectorAll('#rules > div > div + fieldset > div > fieldset > label + div > div > div');
    let i = 0;
    rulesDivs.forEach(() => {
      if (i === this.state.currentRuleIndex) {
        rulesDivs[i].style.display = 'block';
      } else {
        rulesDivs[i].style.display = 'none';
      }
      i += 1;
    });
  }

  showDependentFields() {
    const rules = this.state.rules.slice();

    let i = 0;
    let fields = document.querySelectorAll('fieldset fieldset fieldset fieldset + fieldset fieldset > div > div + div');
    rules.forEach((rule) => {
      if (rule.actions && rule.actions.constructor === Array) {
        rule.actions.forEach((action) => {
          i += 1;
          if (action.action_definition === 'move_to_project') {
            fields[(i * 2) - 1].style.display = 'block';
            fields[(i * 2) - 2].style.display = 'none';
          } else {
            fields[(i * 2) - 1].style.display = 'none';
            fields[(i * 2) - 2].style.display = 'none';
          }
        });
      }
    });

    i = 0;
    fields = document.querySelectorAll('fieldset fieldset fieldset div + fieldset fieldset > div > div + div');
    rules.forEach((rule) => {
      if (rule.rules && rule.rules.constructor === Array) {
        rule.rules.forEach((rule2) => {
          i += 1;
          if (rule2.rule_definition === 'type_is') {
            fields[(i * 4) - 1].style.display = 'none';
            fields[(i * 4) - 2].style.display = 'none';
            fields[(i * 4) - 3].style.display = 'block';
            fields[(i * 4) - 4].style.display = 'none';
          } else if (rule2.rule_definition === 'tagged_as') {
            fields[(i * 4) - 1].style.display = 'none';
            fields[(i * 4) - 2].style.display = 'block';
            fields[(i * 4) - 3].style.display = 'none';
            fields[(i * 4) - 4].style.display = 'none';
          } else if (rule2.rule_definition === 'status_is') {
            fields[(i * 4) - 1].style.display = 'block';
            fields[(i * 4) - 2].style.display = 'none';
            fields[(i * 4) - 3].style.display = 'none';
            fields[(i * 4) - 4].style.display = 'none';
          } else {
            fields[(i * 4) - 1].style.display = 'none';
            fields[(i * 4) - 2].style.display = 'none';
            fields[(i * 4) - 3].style.display = 'none';
            fields[(i * 4) - 4].style.display = 'block';
          }
        });
      }
    });
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

    const rules = this.state.rules.slice();
    let i = 0;
    this.state.rules.forEach((rule) => {
      if (rule.actions && rule.actions.constructor === Array) {
        let j = 0;
        rule.actions.forEach((action) => {
          if (action.action_definition === 'move_to_project') {
            rules[i].actions[j].action_value = action.action_value_move_to_project;
          }
          j += 1;
        });
      }
      i += 1;
    });

    i = 0;
    this.state.rules.forEach((rule) => {
      if (rule.rules && rule.rules.constructor === Array) {
        let j = 0;
        rule.rules.forEach((rule2) => {
          if (rule2.rule_definition === 'type_is') {
            rules[i].rules[j].rule_value = rule2.rule_value_type_is;
          } else if (rule2.rule_definition === 'tagged_as') {
            rules[i].rules[j].rule_value = rule2.rule_value_tagged_as;
          } else if (rule2.rule_definition === 'status_is') {
            rules[i].rules[j].rule_value = rule2.rule_value_status_is;
          }
          j += 1;
        });
      }
      i += 1;
    });

    Relay.Store.commitUpdate(
      new UpdateTeamMutation({
        id: this.props.team.id,
        rules: JSON.stringify(rules),
      }),
      { onSuccess, onFailure },
    );
  }

  showAllRules() {
    const rules = [];
    this.state.rules.forEach((rule) => {
      if (Object.values(rule).join('') !== '') {
        rules.push(rule);
      }
    });
    this.setState({ currentRuleIndex: rules.length, menuIndex: null, rules });
  }

  deleteRule(i) {
    const rules = this.state.rules.slice();
    rules.splice(i, 1);
    this.setState({ menuIndex: null, currentRuleIndex: rules.length, rules });
  }

  selectRule(i) {
    this.setState({ currentRuleIndex: i, menuIndex: null });
  }

  handleMenuClick(i, event) {
    this.setState({ anchorEl: event.currentTarget, menuIndex: i });
  }

  handleCloseMenu = () => {
    this.setState({ anchorEl: null, menuIndex: null });
  };

  render() {
    const { direction } = this.props;
    console.log(this.state.menuIndex);

    const allRules = (
      <List>
        { this.state.rules.map((rule, i) => (
          <ListItem key={rule.name}>
            <ListItemText primary={rule.name} />
            <ListItemSecondaryAction>
              <IconButton onClick={this.handleMenuClick.bind(this, i)}>
                <MoreHorizIcon />
              </IconButton>
              <Menu
                anchorEl={this.state.anchorEl}
                open={this.state.menuIndex === i}
                onClose={this.handleCloseMenu}
              >
                <MenuItem onClick={this.selectRule.bind(this, i)}>
                  <FormattedMessage id="teamRules.edit" defaultMessage="Edit rule" />
                </MenuItem>
                <MenuItem onClick={this.deleteRule.bind(this, i)}>
                  <FormattedMessage id="teamRules.delete" defaultMessage="Delete rule" />
                </MenuItem>
              </Menu>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    );

    return (
      <ContentColumn>
        <Message message={this.state.message} />
        <CardHeaderOutside
          direction={direction}
          title={<FormattedMessage id="teamRules.title" defaultMessage="Rules" />}
        />
        <Card style={{ marginTop: units(2), marginBottom: units(5) }}>
          <CardText>
            {this.state.currentRuleIndex === this.state.rules.length ? allRules : null}
            <StyledSchemaForm intl={this.props.intl}>
              <div id="rules">
                <Form
                  schema={this.state.schema}
                  formData={{ rules: this.state.rules }}
                  onChange={this.handleRulesUpdated.bind(this)}
                />
              </div>
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

                {this.state.currentRuleIndex === this.state.rules.length ?
                  null :
                  <FlatButton
                    primary
                    onClick={this.showAllRules.bind(this)}
                    label={
                      <FormattedMessage
                        id="teamRules.back"
                        defaultMessage="Back"
                      />
                    }
                  />}
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
      forceFetch
    />
  );
};

export default TeamRules;
