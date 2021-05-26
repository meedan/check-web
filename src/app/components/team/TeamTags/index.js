import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import TeamTagsComponent from './TeamTagsComponent';
import { parseStringUnixTimestamp } from '../../../helpers';

const renderQuery = ({ error, props }) => {
  if (!error && props) {
    const { team } = props;
    return (
      <TeamTagsComponent
        teamId={team.id}
        teamDbid={team.dbid}
        rulesSchema={JSON.parse(team.rules_json_schema)}
        rules={team.get_rules}
        permissions={team.permissions}
        tags={team.tag_texts.edges.map(({ node }) => ({ ...node, updated_at: parseStringUnixTimestamp(node.updated_at) }))}
      />
    );
  }

  // TODO: We need a better error handling in the future, standardized with other components
  return null;
};

const TeamTags = props => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query TeamTagsQuery($teamSlug: String!) {
        team(slug: $teamSlug) {
          id
          dbid
          permissions
          get_rules
          rules_json_schema
          tag_texts(first: 10000) {
            edges {
              node {
                id
                text
                tags_count
                updated_at
              }
            }
          }
        }
      }
    `}
    variables={{
      teamSlug: props.teamSlug,
    }}
    render={renderQuery}
  />
);

TeamTags.propTypes = {
  teamSlug: PropTypes.string.isRequired,
};

export default TeamTags;
