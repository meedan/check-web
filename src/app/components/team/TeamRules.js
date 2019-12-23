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
  labelAdd: {
    id: 'teamRules.add',
    defaultMessage: '+ AND',
  },
  labelAnd: {
    id: 'teamRules.and',
    defaultMessage: 'AND',
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
    defaultMessage: 'New Rule',
  },
  confirmDeleteRule: {
    id: 'teamRules.confirmDeleteRule',
    defaultMessage: 'Are you sure you want to delete the rule "{ruleName}"?',
  },
});

const StyledSchemaForm = styled.div`
  div {
    box-shadow: none !important;
  }

  fieldset > label + div div {
    padding-left: 0 !important;
    padding-right: 0 !important;
    display: block;
    box-sizing: border-box;
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
    width: auto;
    border-radius: 5px;
    border: 2px solid transparent;
    position: relative;
  }
  fieldset fieldset fieldset div + fieldset > div::before {
    color: #FFAE53;
  }
  fieldset fieldset fieldset div + fieldset {
    border-color: #FFAE53;
  }
  fieldset fieldset fieldset div + fieldset + fieldset {
    border-color: #3676FC;
  }
  fieldset fieldset fieldset div + fieldset + fieldset > div::before {
    content: "${props => props.intl.formatMessage(messages.labelThen)}";
    color: #3676FC;
  }

  fieldset fieldset fieldset div + fieldset > button,
  fieldset fieldset fieldset div + fieldset + fieldset > button {
    position: absolute;
    right: 0;
    color: #FFAE53;
    border: 0;
    cursor: pointer;
    outline: 0; 
  }
  
  fieldset fieldset fieldset div + fieldset + fieldset > button {
    color: #3676FC;
  }

  fieldset fieldset fieldset div + fieldset > button::before,
  fieldset fieldset fieldset div + fieldset + fieldset > button::before {
    content: "" !important;
  }

  fieldset fieldset fieldset {
    padding: ${units(1)};
    margin-bottom: ${units(1)} !important;
  }

  // Each action or each condition fieldset
  fieldset fieldset fieldset div + fieldset fieldset,
  fieldset fieldset fieldset div + fieldset + fieldset fieldset {
    border-radius: 5px;
    border: 2px solid #CBCBCB;
    width: auto;
    clear: both;
  }
  fieldset fieldset fieldset div + fieldset > div > div > div + div > fieldset::before,
  fieldset fieldset fieldset div + fieldset + fieldset > div > div > div + div > fieldset::before {
    content: "${props => props.intl.formatMessage(messages.labelAnd)}";
    margin-left: -9px;
    margin-top: -37px;
  }
  fieldset fieldset fieldset div + fieldset fieldset label::after,
  fieldset fieldset fieldset div + fieldset + fieldset fieldset label::after {
    content: "*";
    padding-left: 5px;
    color: red;
    font-weight: bold;
  }

  fieldset fieldset fieldset div + fieldset > div > div > div + div > fieldset::before,
  fieldset fieldset fieldset div + fieldset + fieldset > div > div > div + div > fieldset::before,
  fieldset button {
    display: block !important;
    background: transparent !important;
    text-transform: uppercase;
    font-weight: bold;
    color: #ACACAC;
    width: auto !important;
    font-size: 1rem;
  }

  fieldset fieldset fieldset div + fieldset > div > div > div + div > fieldset::before {
    color: #FFAE53;
  }

  fieldset fieldset fieldset div + fieldset + fieldset > div > div > div + div > fieldset::before {
    color: #3676FC;
  }

  fieldset button span {
    display: none;
  }
  
  fieldset fieldset fieldset button::before {
    content: "${props => props.intl.formatMessage(messages.labelAdd)}";
    padding-left: 10px;
  }

  fieldset fieldset + div > button {
    border: 0 !important;
    width: 32px !important;
    float: right;
    margin: 0 6px 8px 0;
  }
  
  fieldset fieldset fieldset fieldset + div {
    border: 0;
  }

  fieldset fieldset fieldset fieldset + div > button span {
    display: none;
  }
  
  // Button to delete an action or condition
  fieldset fieldset fieldset fieldset + div > button::before {
    content: "🗙";
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

  // Button to add a new rule
  #rules > div > fieldset > div > fieldset > div > div > div > button {
    background: #3676FC !important;
    color: #FFF !important;
    font-size: 14px;
    height: 36px;
    width: 100px !important;
    position: absolute;
    top: -10px;
    right: 7px;
    font-weight: 500;
    font-family: Roboto, sans-serif;
    letter-spacing: 0;
    border-radius: 2px;
  }
  #rules > div > fieldset > div > fieldset > div > div > div > button::before {
    content: "${props => props.intl.formatMessage(messages.addRule)}";
  }
`;

const StyledRulesBar = styled.div`
  position: absolute;
  top: -10px;
  right: 7px;
  
  button + button {
    background: #3676FC !important;
    color: #FFF !important;
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
      observer: new MutationObserver(this.observeChanges.bind(this)),
    };
  }

  componentDidMount() {
    this.showDependentFields();
    this.toggleRulesForms();
    const observerConfig = { attributes: true, childList: true, subtree: true };
    this.state.observer.observe(document.getElementsByTagName('BODY')[0], observerConfig);
  }

  componentDidUpdate() {
    this.showDependentFields();
    this.toggleRulesForms();
    this.addClickEventToDeleteButtons();
  }

  componentWillUnmount() {
    this.state.observer.disconnect();
  }

  observeChanges() {
    const rule = this.state.rules[this.state.currentRuleIndex];
    if (rule && rule.project_ids !== '' && rule.project_ids !== '0') {
      const fields = document.querySelectorAll(`li[data-value="${rule.project_ids}"]`);
      let i = 0;
      fields.forEach(() => {
        fields[i].style.display = 'none';
        i += 1;
      });
    }
  }

  addClickEventToDeleteButtons() {
    // Add event to buttons that delete individual conditions or actions
    const buttons = document.querySelectorAll('fieldset fieldset fieldset fieldset + div > button');
    let i = 0;
    buttons.forEach(() => {
      buttons[i].setAttribute('attr-index', i);
      buttons[i].onclick = (e) => { this.deleteActionOrCondition(e); };
      i += 1;
    });

    // Add button to reset conditions or actions
    i = 0;
    const ifs = document.querySelectorAll('fieldset fieldset fieldset div + fieldset');
    ifs.forEach((block) => {
      if (block.firstChild.nodeName !== 'BUTTON') {
        const button = document.createElement('button');
        button.setAttribute('attr-index', i);
        button.onclick = (e) => { this.resetConditions(e); };
        button.append('🗙');
        block.prepend(button);
      }
      i += 1;
    });

    i = 0;
    const thens = document.querySelectorAll('fieldset fieldset fieldset div + fieldset + fieldset');
    thens.forEach((block) => {
      if (block.firstChild.nodeName !== 'BUTTON') {
        const button = document.createElement('button');
        button.setAttribute('attr-index', i);
        button.onclick = (e) => { this.resetActions(e); };
        button.append('🗙');
        block.prepend(button);
      }
      i += 1;
    });
  }

  resetConditions(e) {
    const index = parseInt(e.target.getAttribute('attr-index'), 10);
    const rules = [];
    let i = 0;
    this.state.rules.forEach((rule) => {
      if (i === index) {
        rules.push({
          name: rule.name,
          project_ids: rule.project_ids || '0',
          rules: [{ rule_definition: 'contains_keyword', rule_value: '' }],
          actions: rule.actions,
        });
      } else {
        rules.push(rule);
      }
      i += 1;
    });
    this.setState({ rules });
  }

  resetActions(e) {
    const index = parseInt(e.target.getAttribute('attr-index'), 10);
    const rules = [];
    let i = 0;
    this.state.rules.forEach((rule) => {
      if (i === index) {
        rules.push({
          name: rule.name,
          project_ids: rule.project_ids || '0',
          rules: rule.rules,
          actions: [{ action_definition: 'move_to_project' }],
        });
      } else {
        rules.push(rule);
      }
      i += 1;
    });
    this.setState({ rules });
  }

  deleteActionOrCondition(e) {
    const index = parseInt(e.target.getAttribute('attr-index'), 10);
    const rules = [];
    let i = 0;
    this.state.rules.forEach((rule) => {
      const conditions = [];
      const actions = [];
      if (Array.isArray(rule.rules)) {
        rule.rules.forEach((condition) => {
          if (i !== index) {
            conditions.push(condition);
          }
          i += 1;
        });
      }
      if (Array.isArray(rule.actions)) {
        rule.actions.forEach((action) => {
          if (i !== index) {
            actions.push(action);
          }
          i += 1;
        });
      }
      if (conditions.length === 0) {
        conditions.push({ rule_definition: 'contains_keyword', rule_value: '' });
      }
      if (actions.length === 0) {
        actions.push({ action_definition: 'move_to_project', action_value: '' });
      }
      rules.push({
        name: rule.name,
        project_ids: rule.project_ids || '0',
        rules: conditions,
        actions,
      });
    });
    this.setState({ rules });
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
            fields[(i * 3) - 1].style.display = 'none';
            fields[(i * 3) - 2].style.display = 'block';
            fields[(i * 3) - 3].style.display = 'none';
          } else if (action.action_definition === 'copy_to_project') {
            fields[(i * 3) - 1].style.display = 'block';
            fields[(i * 3) - 2].style.display = 'none';
            fields[(i * 3) - 3].style.display = 'none';
          } else {
            fields[(i * 3) - 1].style.display = 'none';
            fields[(i * 3) - 2].style.display = 'none';
            fields[(i * 3) - 3].style.display = 'none';
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
    const rules = [];

    // Always start with a default list, condition and action
    data.formData.rules.forEach((rule) => {
      if (Object.values(rule).join('') === '') {
        rules.push({
          name: '',
          project_ids: '0',
          rules: [
            {
              rule_definition: 'contains_keyword',
              rule_value: '',
              rule_value_type_is: '',
              rule_value_tagged_as: '',
              rule_value_status_is: '',
            },
          ],
          actions: [
            {
              action_definition: 'move_to_project',
              action_value: '',
              action_value_move_to_project: '',
            },
          ],
        });
      } else {
        let { actions } = rule;
        let conditions = rule.rules;
        if (Array.isArray(rule.actions)) {
          actions = [];
          rule.actions.forEach((action) => {
            if (Object.values(action).join('') === '') {
              actions.push({ action_definition: 'move_to_project' });
            } else {
              actions.push(action);
            }
          });
        }
        if (Array.isArray(rule.rules)) {
          conditions = [];
          rule.rules.forEach((condition) => {
            if (Object.values(condition).join('') === '') {
              conditions.push({ rule_definition: 'contains_keyword' });
            } else {
              conditions.push(condition);
            }
          });
        }
        rules.push({
          name: rule.name,
          project_ids: rule.project_ids || '0',
          rules: conditions,
          actions,
        });
      }
    });

    this.setState({ rules, message: null });
  }

  handleSubmitRules(customMessage) {
    const onSuccess = () => {
      if (customMessage && customMessage.props) {
        this.setState({
          message: customMessage,
        });
      } else {
        this.setState({
          message: <FormattedMessage id="teamRules.success" defaultMessage="Rules updated successfully!" />,
        });
      }
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
          } else if (action.action_definition === 'copy_to_project') {
            rules[i].actions[j].action_value = action.action_value_copy_to_project;
          }
          j += 1;
        });
      }
      i += 1;
    });

    i = 0;
    let nameMissing = false;
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

      if (rule.name === '') {
        nameMissing = true;
      }

      i += 1;
    });

    if (nameMissing) {
      this.setState({
        message: <FormattedMessage id="teamRules.nameMandatory" defaultMessage="Please provide a name for this rule" />,
      });
    } else {
      Relay.Store.commitUpdate(
        new UpdateTeamMutation({
          id: this.props.team.id,
          rules: JSON.stringify(rules),
        }),
        { onSuccess, onFailure },
      );
    }
  }

  showAllRules() {
    const rules = this.props.team.get_rules || [];
    this.setState({
      currentRuleIndex: rules.length,
      menuIndex: null,
      message: null,
      rules,
    });
  }

  deleteRule(i) {
    const rules = this.state.rules.slice();
    if (window.confirm(this.props.intl.formatMessage(
      messages.confirmDeleteRule,
      { ruleName: rules[i].name },
    ))) {
      rules.splice(i, 1);
      this.setState({ menuIndex: null, currentRuleIndex: rules.length, rules }, () => {
        this.handleSubmitRules(<FormattedMessage id="teamRules.deleted" defaultMessage="Rule deleted" />);
      });
    }
  }

  selectRule(i) {
    this.setState({ currentRuleIndex: i, menuIndex: null, message: null });
  }

  handleMenuClick(i, event) {
    this.setState({ anchorEl: event.currentTarget, menuIndex: i });
  }

  handleCloseMenu = () => {
    this.setState({ anchorEl: null, menuIndex: null });
  };

  render() {
    const { direction } = this.props;

    const allRules = (
      <List>
        { this.state.rules.map((rule, i) => (
          <ListItem key={rule.name}>
            <ListItemText primary={rule.name} onClick={this.selectRule.bind(this, i)} />
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
      <div>
        <Message message={this.state.message} />
        <ContentColumn style={{ position: 'relative' }}>
          <CardHeaderOutside
            direction={direction}
            title={<FormattedMessage id="teamRules.title" defaultMessage="Rules" />}
          />
          {this.state.currentRuleIndex === this.state.rules.length ?
            null :
            <StyledRulesBar>
              <FlatButton
                onClick={this.showAllRules.bind(this)}
                label={
                  <FormattedMessage
                    id="teamRules.back"
                    defaultMessage="Back"
                  />
                }
              />
              {' '}
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
            </StyledRulesBar>}
          <Card style={{ marginTop: units(2), marginBottom: units(5) }}>
            <CardText>
              {this.state.currentRuleIndex === this.state.rules.length ? allRules : null}
              {this.state.rules.length > 0 ?
                null :
                <p style={{ textAlign: 'center' }}>
                  <FormattedMessage
                    id="teamRules.none"
                    defaultMessage="No rules yet."
                  />
                </p>}
              <StyledSchemaForm intl={this.props.intl}>
                <div id="rules">
                  <Form
                    schema={this.state.schema}
                    formData={{ rules: this.state.rules }}
                    onChange={this.handleRulesUpdated.bind(this)}
                  />
                </div>
              </StyledSchemaForm>
            </CardText>
          </Card>
        </ContentColumn>
      </div>
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
