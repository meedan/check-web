/* eslint-disable relay/unused-fields */
import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql } from 'react-relay/compat';

const TeamTaskContainer = ({ children, task, team }) => {
  const { dbid } = task;
  const { slug } = team;

  return (
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query TeamTaskContainerQuery($slug: String!, $dbid: Int!) {
          team(slug: $slug) {
            team_task(dbid: $dbid) {
              id
              dbid
              label
              description
              options
              type
              associated_type
              json_schema
              show_in_browser_extension
              required
              conditional_info
              tasks_count
              tasks_with_answers_count
            }
          }
        }
      `}
      render={({ error, props }) => {
        if (!error && props) {
          return <React.Fragment>{children(props.team.team_task)}</React.Fragment>;
        }

        // TODO: We need a better error handling in the future, standardized with other components
        return null;
      }}
      variables={{
        slug,
        dbid,
      }}
    />
  );
};

TeamTaskContainer.defaultProps = {
  task: { dbid: null },
  team: { slug: null },
};

TeamTaskContainer.propTypes = {
  task: PropTypes.shape({
    dbid: PropTypes.number.isRequired,
  }),
  team: PropTypes.shape({
    slug: PropTypes.string.isRequired,
  }),
};

export default TeamTaskContainer;
