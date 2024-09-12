/* eslint-disable relay/unused-fields */
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import TeamTagsComponent from './TeamTagsComponent';
import { parseStringUnixTimestamp } from '../../../helpers';

const TeamTags = (props) => {
  const pageSize = 100;
  const [searchTerm, setSearchTerm] = React.useState('');

  return (<QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query TeamTagsQuery($teamSlug: String!, $pageSize: Int!, $keyword: String) {
        team(slug: $teamSlug) {
          id
          dbid
          permissions
          get_rules
          rules_json_schema
          tag_texts_count
          tag_texts(first: $pageSize, keyword: $keyword) {
            edges {
              node {
                id
                text
                tags_count
                updated_at
              }
            }
            totalCount
          }
        }
      }
    `}
    render={({ error, props: innerProps }) => {
      if (!error && innerProps) {
        return (
          <TeamTagsComponent
            pageSize={pageSize}
            permissions={innerProps.team.permissions}
            relay={innerProps.relay}
            rules={innerProps.team.get_rules}
            rulesSchema={JSON.parse(innerProps.team.rules_json_schema)}
            searchTerm={searchTerm}
            // total of ALL tags
            setSearchTerm={setSearchTerm}
            // total number of search results
            tags={innerProps.team.tag_texts ? innerProps.team.tag_texts.edges.map(({ node }) => ({ ...node, updated_at: parseStringUnixTimestamp(node.updated_at) })) : []}
            teamDbid={innerProps.team.dbid}
            teamId={innerProps.team.id}
            totalTags={innerProps.team.tag_texts_count}
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
