/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { commitMutation, graphql } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import TextField from '../../cds/inputs/TextField';
import ConfirmProceedDialog from '../../layout/ConfirmProceedDialog';
import RuleBody from '../Rules/RuleBody';
import { withSetFlashMessage } from '../../FlashMessage';

const defaultRule = {
  name: '',
  updated_at: null,
  rules: {
    operator: 'and',
    groups: [
      {
        operator: 'and',
        conditions: [
          {
            rule_definition: '',
            rule_value: '',
          },
        ],
      },
    ],
  },
  actions: [],
};

const SaveTag = ({
  onCancel,
  pageSize,
  relay,
  rules,
  rulesSchema,
  setFlashMessage,
  tag,
  teamDbid,
  teamId,
}) => {
  // Find the first rule associated with this tag
  let tagRuleIndex = -1;
  if (tag && rules) {
    tagRuleIndex = rules.findIndex(r => r.actions[0].action_definition === 'add_tag' && r.actions[0].action_value === tag.text);
  }
  const tagRule = (tagRuleIndex > -1 && rules) ? rules[tagRuleIndex] : defaultRule;
  const initialRule = JSON.parse(JSON.stringify(tagRule));

  const [text, setText] = React.useState(tag ? tag.text : '');
  const [rule, setRule] = React.useState(initialRule);
  const [saving, setSaving] = React.useState(false);

  // We only want the rules conditions related to keywords and regular expression
  const filteredRulesSchema = JSON.parse(JSON.stringify(rulesSchema));
  filteredRulesSchema.properties.rules.items.properties.rules.properties.groups.items.properties.conditions.items.properties.rule_definition.enum =
    rulesSchema.properties.rules.items.properties.rules.properties.groups.items.properties.conditions.items.properties.rule_definition.enum.filter(r => /keyword|regexp/.test(r.key));

  const handleError = () => {
    setSaving(false);
    setFlashMessage((
      <FormattedMessage
        defaultMessage="Could not save tag"
        description="Error message displayed when it's not possible to save a team tag"
        id="saveTag.couldNotSave"
      />
    ), 'error');
  };

  const handleSuccess = () => {
    setSaving(false);
    setFlashMessage((
      <FormattedMessage
        defaultMessage="Tag saved successfully"
        description="Message displayed when a team tag is saved"
        id="saveTag.savedSuccessfully"
      />
    ), 'success');
    onCancel();
  };

  const handleSaveRule = () => {
    const newRules = rules ? rules.slice() : [];
    const newRule = {
      ...rule,
      name: `Rule for tag "${text}"`,
      updated_at: parseInt(new Date().getTime() / 1000, 10),
      actions: [
        {
          action_definition: 'add_tag',
          action_value: text,
        },
      ],
    };
    if (tagRuleIndex > -1) {
      if (JSON.stringify(rule) === JSON.stringify(defaultRule)) {
        newRules.splice(tagRuleIndex, 1);
      } else {
        newRules[tagRuleIndex] = newRule;
      }
    } else {
      newRules.push(newRule);
    }

    commitMutation(Store, {
      mutation: graphql`
        mutation SaveTagUpdateTeamMutation($input: UpdateTeamInput!) {
          updateTeam(input: $input) {
            team {
              get_rules
            }
          }
        }
      `,
      variables: {
        input: {
          id: teamId,
          rules: JSON.stringify(newRules),
        },
      },
      onCompleted: (response, error) => {
        if (error) {
          handleError();
        } else {
          handleSuccess(response);
        }
      },
      onError: () => {
        handleError();
      },
    });
  };

  const handleSave = () => {
    if (!text) {
      return false;
    }

    setSaving(true);

    let input = null;
    let mutation = null;

    if (tag) {
      mutation = graphql`
        mutation SaveTagUpdateTagTextMutation($input: UpdateTagTextInput!) {
          updateTagText(input: $input) {
            tag_text {
              id
              text
              tags_count
              updated_at
            }
          }
        }
      `;
      input = {
        id: tag.id,
        text,
      };
    } else {
      mutation = graphql`
        mutation SaveTagCreateTagTextMutation($input: CreateTagTextInput!) {
          createTagText(input: $input) {
            team {
              id
              tag_texts(first: 10000) {
                edges {
                  node {
                    id
                    text
                    tags_count
                    updated_at
                  }
                }
              }
            }
          }
        }
      `;
      input = {
        team_id: teamDbid,
        text,
      };
    }

    commitMutation(Store, {
      mutation,
      variables: {
        input,
      },
      onCompleted: (response, error) => {
        if (error) {
          handleError();
        } else if (JSON.stringify(rule) !== JSON.stringify(initialRule)) {
          handleSaveRule();
          // if we have updated the tags, we use refetchConnection to reset the pagination overall (since we can't figure out exactly where it should be relative to this page, anyway)
          relay?.refetchConnection(pageSize);
        } else {
          handleSuccess(response);
          // if we have updated the tags, we use refetchConnection to reset the pagination overall (since we can't figure out exactly where it should be relative to this page, anyway)
          relay?.refetchConnection(pageSize);
        }
      },
      onError: () => {
        handleError();
      },
    });

    return true;
  };

  return (
    <ConfirmProceedDialog
      body={(
        <React.Fragment>
          <FormattedMessage defaultMessage="New tag name" description="Text field placeholder for the input name of tag" id="saveTag.namePlaceholder" >
            { placeholder => (
              <TextField
                componentProps={{
                  id: 'team-tags__name-input',
                }}
                defaultValue={text}
                label={<FormattedMessage defaultMessage="Name" description="Text field label for the input name of tag" id="saveTag.name" />}
                placeholder={placeholder}
                onBlur={(e) => { setText(e.target.value); }}
              />
            )}
          </FormattedMessage>
          <br />
          <FormattedMessage defaultMessage="Automatically tag items matching the following conditions:" description="Help text about automatically matching tags to a rule" id="saveTag.rule" tagName="p" />
          <RuleBody
            hideActions
            hideName
            rule={rule}
            schema={filteredRulesSchema}
            onChangeRule={(newRule) => { setRule(newRule); }}
            onResetRule={() => { setRule(JSON.parse(JSON.stringify(defaultRule))); }}
          />
        </React.Fragment>
      )}
      open
      proceedDisabled={saving}
      proceedLabel={
        <FormattedMessage
          defaultMessage="Save tag"
          description="Button label to continue saving a new tag via a dialog message"
          id="saveTag.save"
        />
      }
      title={
        tag ?
          <FormattedMessage
            defaultMessage="Edit tag"
            description="Dialog title when editing a tag"
            id="saveTag.titleEdit"
          /> :
          <FormattedMessage
            defaultMessage="Create new tag"
            description="Dialog title when creating a new tag"
            id="saveTag.titleCreate"
          />
      }
      onCancel={onCancel}
      onProceed={handleSave}
    />
  );
};

SaveTag.defaultProps = {
  tag: null, // If null, a new tag is being created
  rules: [],
};

SaveTag.propTypes = {
  tag: PropTypes.shape({
    id: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
  }),
  teamId: PropTypes.string.isRequired,
  teamDbid: PropTypes.number.isRequired,
  rules: PropTypes.arrayOf(PropTypes.object),
  rulesSchema: PropTypes.object.isRequired,
  onCancel: PropTypes.func.isRequired,
  relay: PropTypes.object.isRequired,
};

export default withSetFlashMessage(SaveTag);
