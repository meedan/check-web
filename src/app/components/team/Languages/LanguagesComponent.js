/* eslint-disable @calm/react-intl/missing-attribute */
import React from 'react';
import { PropTypes } from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import List from '@material-ui/core/List';
import AddLanguageAction from './AddLanguageAction';
import LanguageListItem from './LanguageListItem';
import SettingsHeader from '../SettingsHeader';
import { safelyParseJSON } from '../../../helpers';
import { compareLanguages } from '../../../LanguageRegistry';
import { ContentColumn } from '../../../styles/js/shared';

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
              defaultMessage="Languages"
            />
          }
          subtitle={
            <FormattedMessage
              id="languagesComponent.blurb"
              defaultMessage="Add new languages to your workspace in order to create reports, tipline bots and statuses in multiple languages when communicating with users."
            />
          }
          helpUrl="https://help.checkmedia.org/en/articles/4285291-content-language"
          actionButton={
            <AddLanguageAction team={team} />
          }
        />
        <Card>
          <CardContent>
            <List>
              {languages.map(l => (
                <LanguageListItem
                  code={l}
                  key={l}
                  team={team}
                />
              ))}
            </List>
          </CardContent>
        </Card>
      </ContentColumn>
    </React.Fragment>
  );
};

LanguagesComponent.propTypes = {
  team: PropTypes.shape({
    id: PropTypes.string.isRequired,
    get_language: PropTypes.string.isRequired,
    get_languages: PropTypes.string.isRequired,
  }).isRequired,
};

export default createFragmentContainer(LanguagesComponent, graphql`
  fragment LanguagesComponent_team on Team {
    id
    get_language
    get_languages
    ...LanguageListItem_team
    ...AddLanguageAction_team
  }
`);
