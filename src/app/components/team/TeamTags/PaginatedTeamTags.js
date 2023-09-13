/* eslint-disable relay/unused-fields */
import React from 'react';
import PropTypes from 'prop-types';
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
      teamId={props.parentProps.team.id}
      teamDbid={props.parentProps.team.dbid}
      rulesSchema={JSON.parse(props.parentProps.team.rules_json_schema)}
      rules={props.parentProps.team.get_rules}
      permissions={props.parentProps.team.permissions}
      tags={props.root.tag_texts ? props.root.tag_texts.edges.map(({ node }) => ({ ...node, updated_at: parseStringUnixTimestamp(node.updated_at) })) : []}
      // total of ALL tags
      totalTags={props.root.tag_texts_count}
      // total number of search results
      totalCount={props.root.tag_texts?.totalCount}
      pageSize={props.pageSize}
      relay={props.relay}
      searchTerm={props.searchTerm}
      setSearchTerm={props.setSearchTerm}
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

PaginatedTeamTags.propTypes = {
  root: PropTypes.obj.isRequired,
  pageSize: PropTypes.number.isRequired,
  parentProps: PropTypes.obj.isRequired,
  searchTerm: PropTypes.string.isRequired,
  setSearchTerm: PropTypes.func.isRequired,
};

export default PaginatedTeamTags;
