/* eslint-disable relay/unused-fields */
import React from 'react';
import { createPaginationContainer, graphql } from 'react-relay/compat';
import TeamTagsComponent from './TeamTagsComponent';
import { parseStringUnixTimestamp } from '../../../helpers';

// Query that is called for subsequent "load more" pagination calls
// see https://meedan.atlassian.net/wiki/spaces/ENG/pages/1185316865/How+to+paginate+in+Relay+1.7#Modifying-MediaSuggestions
const teamTagsQuery = graphql`
  query PaginatedTeamTagsQuery($teamSlug: String!, $pageSize: Int!, $after: String, $keyword: String) {
    team(slug: $teamSlug) {
      id
      dbid
      permissions
      get_rules
      rules_json_schema
      ...PaginatedTeamTags_root
    }
  }
`;

const PaginatedTeamTags = createPaginationContainer(
  props => (
    <TeamTagsComponent
      pageSize={props.pageSize}
      permissions={props.parentProps.team.permissions}
      relay={props.relay}
      rules={props.parentProps.team.get_rules}
      rulesSchema={JSON.parse(props.parentProps.team.rules_json_schema)}
      searchTerm={props.searchTerm}
      // total of ALL tags
      setSearchTerm={props.setSearchTerm}
      // total number of search results
      tags={props.root.tag_texts ? props.root.tag_texts.edges.map(({ node }) => ({ ...node, updated_at: parseStringUnixTimestamp(node.updated_at) })) : []}
      teamDbid={props.parentProps.team.dbid}
      teamId={props.parentProps.team.id}
      totalCount={props.root.tag_texts?.totalCount}
      totalTags={props.root.tag_texts_count}
    />
  ),
  { // assign graphql fragment to a key called `root`
    root: graphql`
      fragment PaginatedTeamTags_root on Team {
        tag_texts_count
        tag_texts(first: $pageSize, after: $after, keyword: $keyword) @connection(key: "PaginatedTeamTags_tag_texts"){
          edges {
            node {
              id
              text
              tags_count
              updated_at
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
          totalCount
        }
      }
    `,
  },
  { // configuration object
    direction: 'forward',
    query: teamTagsQuery,
    getConnectionFromProps: props => props.root.tag_texts,
    getFragmentVariables: (previousVars, pageSize) => ({
      ...previousVars,
      pageSize,
    }),
    getVariables: (props, paginationInfo, fragmentVariables) => ({
      pageSize: fragmentVariables.pageSize,
      ids: fragmentVariables.ids,
      after: paginationInfo.cursor,
      keyword: fragmentVariables.keyword,
    }),
  },
);

export default PaginatedTeamTags;
