import Relay from 'react-relay/classic';
import optimisticProjectMedia from './optimisticProjectMedia';

class UpdateProjectMediaMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation updateProjectMedia {
      updateProjectMedia
    }`;
  }

  getFatQuery() {
    if (this.props.metadata) {
      return Relay.QL`
        fragment on UpdateProjectMediaPayload {
          project_media {
            id,
            overridden,
            metadata,
          }
        }
      `;
    }
    return Relay.QL`
      fragment on UpdateProjectMediaPayload {
        project_mediaEdge,
        check_search_team { id, number_of_results },
        check_search_trash { id, number_of_results },
        check_search_project { id, number_of_results },
        check_search_project_was { id, number_of_results },
        related_to { id, relationships, log, log_count },
        relationships_target { id },
        relationships_source { id },
        project_media {
          project_id,
          overridden,
          metadata,
          dbid,
          log,
          log_count,
          archived,
          permissions,
          media {
            metadata,
            url,
            quote,
            embed_path,
            thumbnail_path
          },
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
            search_id
          }
        }
      }
    `;
  }

  getOptimisticResponse() {
    if (this.props.metadata) {
      const newEmbed = JSON.parse(this.props.metadata);
      const embed = Object.assign(this.props.media.metadata, newEmbed);
      const permissions = JSON.parse(this.props.media.permissions);
      permissions['update Dynamic'] = false;
      const { overridden } = this.props.media;
      Object.keys(newEmbed).forEach((attribute) => {
        overridden[attribute] = true;
      });
      return {
        project_media: {
          id: this.props.media.id,
          metadata: JSON.stringify(embed),
          overridden: JSON.stringify(overridden),
          permissions: JSON.stringify(permissions),
        },
      };
    }
    if (this.props.related_to_id && this.props.obj) {
      return optimisticProjectMedia(
        this.props.obj.text,
        this.props.project,
        this.props.context,
      );
    }
    if (this.props.archived === 0 && this.props.check_search_trash) {
      const response = optimisticProjectMedia(
        this.props.media,
        this.props.context.project,
        this.props.context,
      );

      response.check_search_trash = {
        id: this.props.check_search_trash.id,
        number_of_results: this.props.check_search_trash.number_of_results - 1,
      };

      response.check_search_team = {
        id: this.props.check_search_team.id,
        number_of_results: this.props.check_search_team.number_of_results + 1,
      };

      response.check_search_project = {
        id: this.props.check_search_project.id,
        number_of_results: this.props.check_search_project.number_of_results + 1,
      };

      response.affectedId = this.props.id;

      return response;
    }
    if (this.props.archived === 1 && this.props.check_search_trash) {
      const response = optimisticProjectMedia(
        this.props.media,
        this.props.context.project,
        this.props.context,
      );

      response.check_search_trash = {
        id: this.props.check_search_trash.id,
        number_of_results: this.props.check_search_trash.number_of_results + 1,
      };

      response.check_search_team = {
        id: this.props.check_search_team.id,
        number_of_results: this.props.check_search_team.number_of_results - 1,
      };

      response.check_search_project = {
        id: this.props.check_search_project.id,
        number_of_results: this.props.check_search_project.number_of_results - 1,
      };

      response.affectedId = this.props.id;
      return response;
    }
    return {};
  }

  getVariables() {
    const vars = {
      id: this.props.id,
      metadata: this.props.metadata,
      project_id: this.props.project_id,
      related_to_id: this.props.related_to_id,
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
      ids.check_search_project_was = this.props.srcProj.search_id;
    }

    if (this.props.dstProj) {
      ids.check_search_project = this.props.dstProj.search_id;
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
            project_media {
              team {
                slug
              }
            }
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

    if (this.props.related_to_id) {
      configs.push({
        type: 'FIELDS_CHANGE',
        fieldIDs: { related_to: this.props.related_to.id },
      });

      configs.push({
        type: 'RANGE_ADD',
        parentName: 'relationships_target',
        parentID: this.props.relationships_target_id,
        connectionName: 'targets',
        edgeName: 'project_mediaEdge',
        rangeBehaviors: {
          '': 'prepend',
        },
      });

      configs.push({
        type: 'RANGE_ADD',
        parentName: 'relationships_source',
        parentID: this.props.relationships_source_id,
        connectionName: 'siblings',
        edgeName: 'project_mediaEdge',
        rangeBehaviors: {
          '': 'prepend',
        },
      });
    }

    if (this.props.srcProj) {
      configs.push({
        type: 'NODE_DELETE',
        parentName: 'check_search_project',
        parentID: this.props.srcProj.search_id,
        connectionName: 'medias',
        deletedIDFieldName: 'affectedId',
      });
    }

    if (this.props.dstProj) {
      configs.push({
        type: 'RANGE_ADD',
        parentName: 'check_search_project',
        parentID: this.props.dstProj.search_id,
        connectionName: 'medias',
        edgeName: 'project_mediaEdge',
        rangeBehaviors: {
          '': 'prepend',
        },
      });
    }

    if (this.props.archived === 1) {
      configs.push({
        type: 'RANGE_DELETE',
        parentName: 'check_search_team',
        parentID: this.props.check_search_team.id,
        connectionName: 'medias',
        pathToConnection: ['check_search_team', 'medias'],
        deletedIDFieldName: 'affectedId',
      });
      configs.push({
        type: 'RANGE_DELETE',
        parentName: 'check_search_project',
        parentID: this.props.check_search_project.id,
        connectionName: 'medias',
        pathToConnection: ['check_search_project', 'medias'],
        deletedIDFieldName: 'affectedId',
      });
      if (this.props.check_search_trash) {
        configs.push({
          type: 'RANGE_ADD',
          parentName: 'check_search_trash',
          parentID: this.props.check_search_trash.id,
          connectionName: 'medias',
          edgeName: 'project_mediaEdge',
          rangeBehaviors: {
            '': 'prepend',
          },
        });
      }
    }

    if (this.props.archived === 0) {
      configs.push({
        type: 'RANGE_ADD',
        parentName: 'check_search_team',
        parentID: this.props.check_search_team.id,
        connectionName: 'medias',
        edgeName: 'project_mediaEdge',
        rangeBehaviors: {
          '': 'prepend',
        },
      });
      configs.push({
        type: 'RANGE_ADD',
        parentName: 'check_search_project',
        parentID: this.props.check_search_project.id,
        connectionName: 'medias',
        edgeName: 'project_mediaEdge',
        rangeBehaviors: {
          '': 'prepend',
        },
      });
      if (this.props.check_search_trash) {
        configs.push({
          type: 'RANGE_DELETE',
          parentName: 'check_search_trash',
          parentID: this.props.check_search_trash.id,
          connectionName: 'medias',
          deletedIDFieldName: 'affectedId',
          pathToConnection: ['check_search_trash', 'medias'],
        });
      }
    }

    return configs;
  }
}

export default UpdateProjectMediaMutation;
