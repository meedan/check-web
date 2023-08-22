import React from 'react';
import { PropTypes } from 'prop-types';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { createFragmentContainer, graphql, commitMutation } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import List from '@material-ui/core/List';
import cx from 'classnames/bind';
import AddLanguageAction from './AddLanguageAction';
import LanguageListItem from './LanguageListItem';
import SettingsHeader from '../SettingsHeader';
import { FlashMessageSetterContext } from '../../FlashMessage';
import GenericUnknownErrorMessage from '../../GenericUnknownErrorMessage';
import SwitchComponent from '../../cds/inputs/SwitchComponent';
import { safelyParseJSON, getErrorMessageForRelayModernProblem } from '../../../helpers';
import { compareLanguages, languageLabelFull } from '../../../LanguageRegistry';
import styles from './LanguagesComponent.module.css';
import settingsStyles from '../Settings.module.css';

const submitToggleLanguageDetection = ({
  team,
  value,
  onSuccess,
  onFailure,
}) => {
  commitMutation(Relay.Store, {
    mutation: graphql`
      mutation LanguagesComponentToggleLanguageDetectionMutation($input: UpdateTeamInput!) {
        updateTeam(input: $input) {
          team {
            id
            get_language_detection
          }
        }
      }
    `,
    variables: {
      input: {
        id: team.id,
        language_detection: value,
      },
    },
    onError: onFailure,
    onCompleted: ({ data, errors }) => {
      if (errors) {
        return onFailure(errors);
      }
      return onSuccess(data);
    },
  });
};

const LanguagesComponent = ({ team }) => {
  const defaultCode = team.get_language || 'en';
  const setFlashMessage = React.useContext(FlashMessageSetterContext);

  let languages = safelyParseJSON(team.get_languages) || [];
  languages = languages.sort((a, b) => compareLanguages(defaultCode, a, b));

  const toggleLanguageDetection = (value) => {
    const onFailure = (errors) => {
      setFlashMessage((
        getErrorMessageForRelayModernProblem(errors)
        || <GenericUnknownErrorMessage />
      ), 'error');
    };

    submitToggleLanguageDetection({
      team,
      value,
      onSuccess: () => {},
      onFailure,
    });
  };

  return (
    <React.Fragment>
      <SettingsHeader
        title={
          <FormattedMessage
            id="languagesComponent.title"
            defaultMessage="Language"
            description="Title of Language settings page"
          />
        }
        helpUrl="https://help.checkmedia.org/en/articles/4498863-languages"
        actionButton={
          <AddLanguageAction team={team} />
        }
      />
      <div className={cx(settingsStyles['setting-details-wrapper'])}>
        <div className={cx(settingsStyles['setting-content-container'], styles['team-languages-section'])}>
          <div className="typography-subtitle2">
            <FormattedMessage
              id="languagesComponent.languageDetection"
              defaultMessage="Language detection"
              description="Title of the Language detection section in language settings page"
            />
          </div>
          <div className="typography-body2">
            <FormattedHTMLMessage
              id="languagesComponent.description"
              defaultMessage="If language detection is <strong>enabled</strong>, the Check Tipline bot will automatically recognize and respond in the language of your user's request.
              If <strong>disabled</strong>, the Check Tipline bot will respond in the workspace default language: <strong>{defaultLanguage}</strong>"
              description="Instructions for the language detection toggle switch"
              values={{ defaultLanguage: languageLabelFull(team.get_language) }}
            />
          </div>
          <div>
            <SwitchComponent
              label={
                <FormattedMessage
                  id="languagesComponent.languageDetectionSwitch"
                  defaultMessage="Enable language detection"
                  description="Label for a switch where the user toggles auto language detection"
                />
              }
              checked={team.get_language_detection}
              onChange={toggleLanguageDetection}
            />
          </div>
        </div>
        <div className={cx(settingsStyles['setting-content-container'], styles['team-languages-section'])}>
          <div className="typography-subtitle2">
            <FormattedMessage
              id="languagesComponent.languages"
              defaultMessage="Languages"
              description="Title of the active languages list section in language settings page"
            />
          </div>
          <List>
            {languages.map(l => (
              <LanguageListItem
                code={l}
                key={l}
                team={team}
              />
            ))}
          </List>
        </div>
      </div>
    </React.Fragment>
  );
};

LanguagesComponent.propTypes = {
  team: PropTypes.shape({
    get_language: PropTypes.string.isRequired,
    get_languages: PropTypes.string.isRequired,
  }).isRequired,
};

export default createFragmentContainer(LanguagesComponent, graphql`
  fragment LanguagesComponent_team on Team {
    id
    get_language
    get_languages
    get_language_detection
    ...LanguageListItem_team
    ...AddLanguageAction_team
  }
`);
