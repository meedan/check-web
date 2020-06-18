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
            title,
            description,
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
        project { medias_count },
        project_was { medias_count },
        related_to { id, relationships, log, log_count, demand, requests_count, linked_items_count },
        relationships_target { id },
        relationships_source { id },
        project_media {
          demand
          requests_count
          linked_items_count
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
            id
            slug
            medias_count
            public_team {
              trash_count
            }
          }
          project {
            id
            title
            search_id
            medias_count
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
          title: embed.title,
          description: embed.description,
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

      if (this.props.check_search_project) {
        response.check_search_project = {
          id: this.props.check_search_project.id,
          number_of_results: this.props.check_search_project.number_of_results + 1,
        };
      }

      response.project = {
        id: this.props.media.project.id,
        medias_count: this.props.media.project.medias_count + 1,
        team: {
          id: this.props.context.team.id,
          medias_count: this.props.context.team.medias_count + 1,
          public_team: {
            id: this.props.context.team.public_team.id,
            trash_count: this.props.context.team.public_team.trash_count - 1,
          },
        },
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

      if (this.props.check_search_project) {
        response.check_search_project = {
          id: this.props.check_search_project.id,
          number_of_results: this.props.check_search_project.number_of_results - 1,
        };
      }

      if (this.props.context.project) {
        response.project = {
          id: this.props.media.project.id,
          medias_count: this.props.context.project.medias_count - 1,
          team: {
            id: this.props.context.team.id,
            medias_count: this.props.context.team.medias_count - 1,
            public_team: {
              id: this.props.context.team.public_team.id,
              trash_count: this.props.context.team.public_team.trash_count + 1,
            },
          },
        };
      }

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
    const ids = {};

    const configs = [{
      type: 'FIELDS_CHANGE',
      fieldIDs: ids,
    }];

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
        rangeBehaviors: () => ('prepend'),
      });

      configs.push({
        type: 'RANGE_ADD',
        parentName: 'relationships_source',
        parentID: this.props.relationships_source_id,
        connectionName: 'siblings',
        edgeName: 'project_mediaEdge',
        rangeBehaviors: () => ('prepend'),
      });

      configs.push({
        type: 'RANGE_DELETE',
        parentName: 'check_search_team',
        parentID: this.props.context.team.search_id,
        connectionName: 'medias',
        pathToConnection: ['check_search_team', 'medias'],
        deletedIDFieldName: 'affectedId',
      });

      if (this.props.context.project) {
        configs.push({
          type: 'RANGE_DELETE',
          parentName: 'check_search_project',
          parentID: this.props.context.project.search_id,
          connectionName: 'medias',
          pathToConnection: ['check_search_project', 'medias'],
          deletedIDFieldName: 'affectedId',
        });
      }
    }

    if (this.props.srcProj) {
      configs.push({
        type: 'RANGE_DELETE',
        parentName: 'check_search_project',
        parentID: this.props.srcProj.search_id,
        connectionName: 'medias',
        pathToConnection: ['check_search_project', 'medias'],
        deletedIDFieldName: 'affectedId',
      });

      ids.check_search_project_was = this.props.srcProj.search_id;
      ids.project_was = this.props.srcProj.id;
    }

    if (this.props.dstProj) {
      configs.push({
        type: 'RANGE_ADD',
        parentName: 'check_search_project',
        parentID: this.props.dstProj.search_id,
        connectionName: 'medias',
        edgeName: 'project_mediaEdge',
        rangeBehaviors: () => ('prepend'),
      });

      ids.check_search_project = this.props.dstProj.search_id;
      ids.project = this.props.dstProj.id;
    } else {
      configs.push({
        type: 'REQUIRED_CHILDREN',
        children: [Relay.QL`
          fragment on UpdateProjectMediaPayload {
            project_media {
              team {
                slug
              }
            }
            project {
              id
              medias_count
              team {
                id
                medias_count
                public_team {
                  id
                  trash_count
                }
              }
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
      if (this.props.check_search_project) {
        configs.push({
          type: 'RANGE_DELETE',
          parentName: 'check_search_project',
          parentID: this.props.check_search_project.id,
          connectionName: 'medias',
          pathToConnection: ['check_search_project', 'medias'],
          deletedIDFieldName: 'affectedId',
        });
      }
      if (this.props.check_search_trash) {
        configs.push({
          type: 'RANGE_ADD',
          parentName: 'check_search_trash',
          parentID: this.props.check_search_trash.id,
          connectionName: 'medias',
          edgeName: 'project_mediaEdge',
          rangeBehaviors: () => ('prepend'),
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
        rangeBehaviors: () => ('prepend'),
      });
      if (this.props.check_search_project) {
        configs.push({
          type: 'RANGE_ADD',
          parentName: 'check_search_project',
          parentID: this.props.check_search_project.id,
          connectionName: 'medias',
          edgeName: 'project_mediaEdge',
          rangeBehaviors: () => ('prepend'),
        });
      }
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
