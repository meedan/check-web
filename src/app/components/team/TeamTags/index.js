/* eslint-disable relay/unused-fields */
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import PaginatedTeamTags from './PaginatedTeamTags';

const TeamTags = (props) => {
  const pageSize = 100;
  const [searchTerm, setSearchTerm] = React.useState('');

  return (<QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query TeamTagsQuery($teamSlug: String!, $pageSize: Int!, $after: String, $keyword: String) {
        team(slug: $teamSlug) {
          id
          dbid
          permissions
          get_rules
          rules_json_schema
          ...PaginatedTeamTags_root
        }
      }
    `}
    render={({ error, props: innerProps }) => {
      if (!error && innerProps) {
        const { team } = innerProps;

        return (
          <PaginatedTeamTags
            pageSize={pageSize}
            parentProps={innerProps}
            root={team}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        );
      }
      return null;
    }}
    variables={{
      teamSlug: props.teamSlug,
      pageSize,
      keyword: searchTerm,
    }}
  />);
};

TeamTags.propTypes = {
  teamSlug: PropTypes.string.isRequired,
};

export default TeamTags;
