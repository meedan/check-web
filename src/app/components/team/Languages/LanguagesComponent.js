import React from 'react';
import { PropTypes } from 'prop-types';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import List from '@material-ui/core/List';
import AddLanguageAction from './AddLanguageAction';
import LanguageListItem from './LanguageListItem';
import SettingsHeader from '../SettingsHeader';
import SwitchComponent from '../../cds/inputs/SwitchComponent';
import { safelyParseJSON } from '../../../helpers';
import { compareLanguages } from '../../../LanguageRegistry';
import { ContentColumn } from '../../../styles/js/shared';
import styles from './LanguagesComponent.module.css';

const LanguagesComponent = ({ team }) => {
  const defaultCode = team.get_language || 'en';

  let languages = safelyParseJSON(team.get_languages) || [];
  languages = languages.sort((a, b) => compareLanguages(defaultCode, a, b));

  return (
    <React.Fragment>
      <ContentColumn large>
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
        <div className={styles['team-languages-section']}>
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
              values={{ defaultLanguage: team.get_language }}
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
              checked
              onChange={() => {

              }}
            />
          </div>
        </div>
        <div className={styles['team-languages-section']}>
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
      </ContentColumn>
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
    get_language
    get_languages
    get_language_detection
    ...LanguageListItem_team
    ...AddLanguageAction_team
  }
`);
