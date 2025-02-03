import React from 'react';
import { createPaginationContainer, graphql } from 'react-relay/compat';
import ChatHistory from '../layout/ChatHistory';

// Query that is called for subsequent "load more" pagination calls
// see https://meedan.atlassian.net/wiki/spaces/ENG/pages/1185316865/How+to+paginate+in+Relay+1.7#Modifying-MediaSuggestions
const tiplineHistoryQuery = graphql`
  query PaginatedTiplineHistoryQuery($teamSlug: String!, $pageSize: Int!, $after: String, $uid: String!) {
    team(slug: $teamSlug) {
      ...PaginatedTiplineHistory_root
    }
  }
`;

const PaginatedTiplineHistory = createPaginationContainer(
  props => (
    <ChatHistory
      handleClose={props.handleClose}
      history={props.root.tipline_messages ? props.root.tipline_messages.edges.map(({ node }) => ({
        dbid: node.dbid,
        event: node.event,
        direction: node.direction,
        language: node.language,
        platform: node.platform,
        uid: node.uid,
        external_id: node.external_id,
        payload: node.payload,
        team_id: node.team_id,
        state: node.state,
        sent_at: node.sent_at,
        media_url: node.media_url,
      })) : []}
      pageSize={props.pageSize}
      relay={props.relay}
      title={props.title}
    />
  ),
  { // assign graphql fragment to a key called `root`
    root: graphql`
      fragment PaginatedTiplineHistory_root on Team {
        id
        dbid
        tipline_messages(first: $pageSize, after: $after, uid: $uid) @connection(key: "PaginatedTiplineHistory_tipline_messages"){
          edges {
            node {
              dbid
              event
              direction
              language
              platform
              uid
              external_id
              payload
              team_id
              state
              sent_at
              media_url
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `,
  },
  { // configuration object
    direction: 'forward',
    query: tiplineHistoryQuery,
    getConnectionFromProps: props => props.root.tag_texts,
    getFragmentVariables: (previousVars, pageSize) => ({
      ...previousVars,
      pageSize,
    }),
    getVariables: (props, paginationInfo, fragmentVariables) => ({
      pageSize: fragmentVariables.pageSize,
      ids: fragmentVariables.ids,
      after: paginationInfo.cursor,
      uid: fragmentVariables.uid,
    }),
  },
);

export default PaginatedTiplineHistory;

