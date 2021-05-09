import React from 'react';
import PropTypes from 'prop-types';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import Search from '../search/Search';
import { safelyParseJSON } from '../../helpers';

const ProjectGroup = ({ routeParams }) => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query ProjectGroupQuery($id: ID!) {
        project_group(id: $id) {
          dbid
          title
        }
      }
    `}
    variables={{
      id: routeParams.projectGroupId,
    }}
    render={({ error, props }) => {
      if (!error && props) {
        const query = {
          ...safelyParseJSON(routeParams.query, {}),
          project_group_id: props.project_group.dbid,
        };

        return (
          <div className="project-group">
            <Search
              searchUrlPrefix={`/${routeParams.team}/collection/${routeParams.projectGroupId}`}
              mediaUrlPrefix={`/${routeParams.team}/media`}
              title={props.project_group.title}
              listDescription={props.project_group.description}
              teamSlug={routeParams.team}
              query={query}
              hideFields={['read', 'project']}
            />
          </div>
        );
      }
      return null;
    }}
  />
);

ProjectGroup.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired,
    projectGroupId: PropTypes.string.isRequired,
    query: PropTypes.string, // JSON-encoded value; can be empty/null/invalid
  }).isRequired,
};

export default ProjectGroup;
