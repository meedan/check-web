import React from 'react';
import PropTypes from 'prop-types';
import { commitMutation, graphql } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
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

const useStyles = makeStyles(theme => ({
  saveTagRulesTitle: {
    marginTop: theme.spacing(5),
  },
}));

const SaveTag = ({
  tag,
  teamId,
  teamDbid,
  rules,
  rulesSchema,
  onCancel,
  setFlashMessage,
}) => {
  const classes = useStyles();

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
        id="saveTag.couldNotSave"
        defaultMessage="Could not save tag"
        description="Error message displayed when it's not possible to save a team tag"
      />
    ), 'error');
  };

  const handleSuccess = () => {
    setSaving(false);
    setFlashMessage((
      <FormattedMessage
        id="saveTag.savedSuccessfully"
        defaultMessage="Tag saved successfully"
        description="Message displayed when a team tag is saved"
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
      newRules[tagRuleIndex] = newRule;
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
        } else {
          handleSuccess(response);
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
      open
      title={
        tag ?
          <FormattedMessage
            id="saveTag.titleEdit"
            defaultMessage="Edit tag"
          /> :
          <FormattedMessage
            id="saveTag.titleCreate"
            defaultMessage="Create new tag"
          />
      }
      body={(
        <React.Fragment>
          <TextField
            id="team-tags__name-input"
            defaultValue={text}
            label={<FormattedMessage id="saveTag.name" defaultMessage="Name" />}
            onBlur={(e) => { setText(e.target.value); }}
            variant="outlined"
            fullWidth
          />
          <Typography variant="body1" className={classes.saveTagRulesTitle}>
            <FormattedMessage id="saveTag.rule" defaultMessage="Automatically tag items matching the following conditions:" />
          </Typography>
          <RuleBody
            noMargin
            hideName
            hideActions
            schema={filteredRulesSchema}
            rule={rule}
            onChangeRule={(newRule) => { setRule(newRule); }}
          />
        </React.Fragment>
      )}
      proceedDisabled={saving}
      proceedLabel={
        <FormattedMessage
          id="saveTag.save"
          defaultMessage="Save tag"
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
};

export default withSetFlashMessage(SaveTag);
