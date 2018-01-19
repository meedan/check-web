import Relay from 'react-relay';

class UpdateProjectMediaMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation updateProjectMedia {
      updateProjectMedia
    }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on UpdateProjectMediaPayload {
        project_mediaEdge,
        check_search_team { id }
        check_search_project { id }
        project_media {
          project_id,
          overridden,
          embed,
          dbid,
          log,
          log_count,
          archived,
          permissions,
          tasks(first: 10000) {
            edges {
              node {
                permissions
                first_response {
                  permissions
                }
              }
            }
          }
          team {
            slug
          }
          project {
            title
          }
        }
        project {
          project_medias
        }
        project_was {
          project_medias
        }
      }
    `;
  }

  getVariables() {
    const vars = {
      id: this.props.id,
      embed: this.props.embed,
      project_id: this.props.project_id,
      refresh_media: this.props.refresh_media,
      update_mt: this.props.update_mt,
      archived: this.props.archived,
    };
    if (this.props.srcProj) {
      vars.previous_project_id = this.props.srcProj.dbid;
    }
    return vars;
  }

  getConfigs() {
    const ids = { project_media: this.props.id };
    if (this.props.srcProj) {
      ids.project_was = this.props.srcProj.id;
    }
    if (this.props.dstProj) {
      ids.project = this.props.dstProj.id;
    }

    const configs = [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: ids,
      },
      {
        type: 'REQUIRED_CHILDREN',
        children: [Relay.QL`
          fragment on UpdateProjectMediaPayload {
            project {
              project_medias(first: 20) {
                edges {
                  node {
                    id
                  }
                }
              }
            },
          }`,
        ],
      },
    ];

    if (this.props.archived === 1) {
      configs.push({
        type: 'RANGE_DELETE',
        parentName: 'check_search_team',
        parentID: this.props.check_search_team,
        connectionName: 'medias',
        pathToConnection: ['check_search_team', 'medias'],
        deletedIDFieldName: 'affectedId',
      });
      configs.push({
        type: 'RANGE_DELETE',
        parentName: 'check_search_project',
        parentID: this.props.check_search_project,
        connectionName: 'medias',
        pathToConnection: ['check_search_project', 'medias'],
        deletedIDFieldName: 'affectedId',
      });
    }

    if (this.props.archived === 0) {
      configs.push({
        type: 'RANGE_ADD',
        parentName: 'check_search_team',
        parentID: this.props.check_search_team,
        connectionName: 'medias',
        edgeName: 'project_mediaEdge',
        rangeBehaviors: {
          '': 'prepend',
        },
      });
      configs.push({
        type: 'RANGE_ADD',
        parentName: 'check_search_project',
        parentID: this.props.check_search_project,
        connectionName: 'medias',
        edgeName: 'project_mediaEdge',
        rangeBehaviors: {
          '': 'prepend',
        },
      });
    }

    return configs;
  }
}

export default UpdateProjectMediaMutation;
