import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import { graphql, commitMutation } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import Rule from './Rule';
import RulesTable from './RulesTable';
import { columnWidthMedium } from '../../../styles/js/shared';
import { safelyParseJSON } from '../../../helpers';
import { withSetFlashMessage } from '../../FlashMessage';

const useStyles = makeStyles(theme => ({
  paper: {
    width: columnWidthMedium,
    padding: theme.spacing(2),
    margin: '0 auto',
    boxShadow: 'none',
  },
}));

const RulesComponent = (props) => {
  const classes = useStyles();

  const propRules = props.team.get_rules ? props.team.get_rules.slice(0) : [];
  const [rules, setRules] = React.useState(propRules);
  const [currentRuleIndex, setCurrentRuleIndex] = React.useState(null);

  const handleSetCurrentRuleIndex = (newCurrentRuleIndex) => {
    setCurrentRuleIndex(newCurrentRuleIndex);
  };

  const handleError = (error) => {
    let errorMessage = <FormattedMessage id="rulesComponent.defaultErrorMessage" defaultMessage="Could not save rules" />;
    const json = safelyParseJSON(error.source);
    if (json && json.errors && json.errors[0] && json.errors[0].message) {
      errorMessage = json.errors[0].message;
    }
    props.setFlashMessage(errorMessage);
  };

  const handleSuccess = () => {
    props.setFlashMessage(<FormattedMessage id="rulesComponent.savedSuccessfully" defaultMessage="Rules saved successfully!" />);
  };

  const handleUpdateRules = (newRules, commit) => {
    setRules(newRules);
    if (commit !== false) {
      commitMutation(Store, {
        mutation: graphql`
          mutation RulesComponentUpdateTeamMutation($input: UpdateTeamInput!) {
            updateTeam(input: $input) {
              team {
                id
                get_rules
              }
            }
          }
        `,
        variables: {
          input: {
            id: props.team.id,
            rules: JSON.stringify(newRules),
          },
        },
        onCompleted: (response, error) => {
          if (error) {
            handleError(error);
          } else {
            handleSuccess();
          }
        },
        onError: (error) => {
          handleError(error);
        },
      });
    }
  };

  return (
    <Paper className={classes.paper}>
      { currentRuleIndex !== null ?
        <Rule
          rules={rules}
          index={currentRuleIndex}
          schema={JSON.parse(props.team.rules_json_schema)}
          onSetCurrentRuleIndex={handleSetCurrentRuleIndex}
          onUpdateRules={handleUpdateRules}
        /> :
        <RulesTable
          rules={rules}
          onSetCurrentRuleIndex={handleSetCurrentRuleIndex}
          onUpdateRules={handleUpdateRules}
        /> }
    </Paper>
  );
};

RulesComponent.propTypes = {
  team: PropTypes.object.isRequired,
  setFlashMessage: PropTypes.func.isRequired,
};

export default withSetFlashMessage(RulesComponent);
