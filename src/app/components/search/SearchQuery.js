import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import Relay from 'react-relay/classic';
import SearchQueryComponent, { StyledSearchInput } from './SearchQueryComponent';
import TeamRoute from '../../relay/TeamRoute';
import { ContentColumn } from '../../styles/js/shared';

const queryWithoutProjects = Relay.QL`
  fragment on Team {
    id,
    dbid,
    media_verification_statuses,
    translation_statuses,
    get_suggested_tags,
    dynamic_search_fields_json_schema,
    name,
    slug,
  }
`;

const queryWithProjects = Relay.QL`
  fragment on Team {
    id,
    dbid,
    media_verification_statuses,
    translation_statuses,
    get_suggested_tags,
    dynamic_search_fields_json_schema,
    name,
    slug,
    projects(first: 10000) {
      edges {
        node {
          title,
          dbid,
          id,
          description
        }
      }
    }
  }
`;

const messages = defineMessages({
  loading: {
    id: 'search.loading',
    defaultMessage: 'Loading...',
  },
});

const SearchQuery = (props) => {
  const gqlquery = props.project ? queryWithoutProjects : queryWithProjects;

  const SearchQueryContainer = Relay.createContainer(injectIntl(SearchQueryComponent), {
    fragments: {
      team: () => gqlquery,
    },
  });

  const { fields, teamSlug, intl } = props;
  const queryRoute = new TeamRoute({ teamSlug });

  return (
    <Relay.RootContainer
      Component={SearchQueryContainer}
      route={queryRoute}
      renderFetched={data => <SearchQueryContainer {...props} {...data} />}
      renderLoading={() => (
        <ContentColumn>
          {!fields || fields.indexOf('keyword') > -1 ?
            <div className="search__form search__form--loading">
              <StyledSearchInput
                disabled
                placeholder={intl.formatMessage(messages.loading)}
                name="search-input"
                id="search-input"
              />
            </div>
            : null}
        </ContentColumn>)
      }
    />
  );
};

export default injectIntl(SearchQuery);
