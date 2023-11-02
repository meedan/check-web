import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { safelyParseJSON } from '../../../helpers';
import NewsletterComponent from './NewsletterComponent';
import createEnvironment from '../../../relay/EnvironmentModern';

const Newsletter = () => {
  const [language, setLanguage] = React.useState(null);

  return (
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query NewsletterQuery {
          me {
            token
          }
          team {
            slug
            get_language
            get_languages
            ...NewsletterComponent_team
          }
        }
      `}
      variables={{ language }}
      render={({ props }) => {
        const environment = createEnvironment(props?.me?.token, props?.team?.slug);

        if (props && props.team) {
          const languages = safelyParseJSON(props.team.get_languages, []);
          return (
            <NewsletterComponent
              team={props.team}
              environment={environment}
              language={language || props.team.get_language || languages[0] || 'en'}
              languages={languages}
              onChangeLanguage={setLanguage}
            />
          );
        }
        return null;
      }}
    />
  );
};

export default Newsletter;
