import React from 'react';
import { PropTypes } from 'prop-types';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { createFragmentContainer, graphql, commitMutation } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import AddLanguageAction from './AddLanguageAction';
import LanguageListItem from './LanguageListItem';
import SettingsHeader from '../SettingsHeader';
import { FlashMessageSetterContext } from '../../FlashMessage';
import GenericUnknownErrorMessage from '../../GenericUnknownErrorMessage';
import Alert from '../../cds/alerts-and-prompts/Alert';
import SwitchComponent from '../../cds/inputs/SwitchComponent';
import { safelyParseJSON, getErrorMessageForRelayModernProblem } from '../../../helpers';
import { compareLanguages, languageLabelFull } from '../../../LanguageRegistry';
import settingsStyles from '../Settings.module.css';

const submitToggleLanguageDetection = ({
  onFailure,
  onSuccess,
  team,
  value,
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

  const [languages, setLanguages] = React.useState(safelyParseJSON(team.get_languages, []).sort((a, b) => compareLanguages(defaultCode, a, b)));

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
        actionButton={
          <AddLanguageAction setLanguages={setLanguages} team={team} />
        }
        context={
          <FormattedHTMLMessage
            defaultMessage='Manage tipline language settings. <a href="{helpLink}" target="_blank" title="Learn more">Learn more about language support</a>.'
            description="Context description for the functionality of this page"
            id="languagesComponent.helpContext"
            values={{ helpLink: 'https://help.checkmedia.org/en/articles/8772818-tipline-languages' }}
          />
        }
        title={
          <FormattedMessage
            defaultMessage="Language"
            description="Title of Language settings page"
            id="languagesComponent.title"
          />
        }
      />
      <div className={settingsStyles['setting-details-wrapper']}>
        <div className={settingsStyles['setting-content-container']}>
          <div className={settingsStyles['setting-content-container-title']}>
            <FormattedMessage
              defaultMessage="Language detection"
              description="Title of the Language detection section in language settings page"
              id="languagesComponent.languageDetection"
            />
          </div>
          <SwitchComponent
            checked={team.get_language_detection}
            label={
              <FormattedMessage
                defaultMessage="Enable language detection"
                description="Label for a switch where the user toggles auto language detection"
                id="languagesComponent.languageDetectionSwitch"
              />
            }
            onChange={toggleLanguageDetection}
          />
          <Alert
            content={
              team.get_language_detection ?
                <FormattedHTMLMessage
                  defaultMessage="The Check Tipline bot will automatically recognize and respond in the language of your user's request."
                  description="Instructions for the language detection toggle switch when enabled"
                  id="languagesComponent.enabledDescription"
                />
                :
                <FormattedHTMLMessage
                  defaultMessage="The Check Tipline bot will respond in the workspace default language: <strong>{defaultLanguage}</strong>"
                  description="Instructions for the language detection toggle switch when disabled"
                  id="languagesComponent.disabledDescription"
                  values={
                    {
                      defaultLanguage: languageLabelFull(team.get_language),
                    }
                  }
                />
            }
            icon
            title={
              team.get_language_detection ?
                <FormattedHTMLMessage
                  defaultMessage="Language detection is enabled"
                  description="Title for extra information about the language detection toggle switch when it is enabled"
                  id="languagesComponent.alertTitleEnabled"
                />
                :
                <FormattedHTMLMessage
                  defaultMessage="Language detection is disabled"
                  description="Title for extra information about the language detection toggle switch when it is disabled"
                  id="languagesComponent.alertTitleDisabled"
                />
            }
            variant={team.get_language_detection ? 'info' : 'warning'}
          />
        </div>
        <div className={settingsStyles['setting-content-container']}>
          <div className={settingsStyles['setting-content-container-title']}>
            <FormattedMessage
              defaultMessage="Supported Languages [{languageCount}]"
              description="Title of the active languages list section in language settings page"
              id="languagesComponent.languages"
              values={{ languageCount: languages.length }}
            />
          </div>
          <ul className={settingsStyles['setting-content-list']}>
            {languages.map(l => (
              <LanguageListItem
                code={l}
                key={l}
                setLanguages={setLanguages}
                team={team}
              />
            ))}
          </ul>
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
