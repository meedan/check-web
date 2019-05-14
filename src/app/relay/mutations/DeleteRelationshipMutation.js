import Relay from 'react-relay/classic';

class DeleteRelationshipMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation destroyRelationship {
      destroyRelationship
    }`;
  }

  getVariables() {
    const vars = { id: this.props.id };
    if (this.props.current) {
      vars.current_id = this.props.current.dbid;
    }
    return vars;
  }

  getOptimisticResponse() {
    if (!this.props.current) {
      const target = this.props.media;
      return {
        target_project_media: {
          id: target.id,
          __typename: 'ProjectMedia',
          relationships: {
            sources_count: 0,
            targets_count: 0,
            id: target.relationships.id,
            targets: { edges: [] },
            sources: { edges: [] },
          },
          relationship: null,
        },
      };
    } else if (this.props.media.target_id) {
      return {
        deletedId: this.props.media.id,
        relationships_target: {
          id: this.props.media.target_id,
        },
      };
    } else if (this.props.media.source_id) {
      return {
        deletedId: this.props.media.id,
        relationships_source: {
          id: this.props.media.source_id,
        },
      };
    }
    return {
      deletedId: this.props.media.id,
    };
  }

  getFatQuery() {
    return Relay.QL`fragment on DestroyRelationshipPayload {
      deletedId
      relationships_target { id, targets }
      source_project_media { dbid, id, __typename, relationships }
      target_project_media { dbid, id, __typename, relationships, relationship }
      current_project_media { dbid, id, __typename, relationships }
    }`;
  }

  getConfigs() {
    const ids = {
      source_project_media: this.props.source.id,
      target_project_media: this.props.target.id,
    };

    if (this.props.current) {
      ids.current_project_media = this.props.current.id;
    }

    const configs = [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: ids,
      },
    ];

    if (this.props.media.target_id) {
      configs.push({
        type: 'RANGE_DELETE',
        parentName: 'relationships_target',
        parentID: this.props.media.target_id,
        connectionName: 'targets',
        pathToConnection: ['relationships_target', 'targets'],
        deletedIDFieldName: 'deletedId',
      });
    }

    if (this.props.media.source_id) {
      configs.push({
        type: 'RANGE_DELETE',
        parentName: 'relationships_source',
        parentID: this.props.media.source_id,
        connectionName: 'siblings',
        pathToConnection: ['relationships_source', 'siblings'],
        deletedIDFieldName: 'deletedId',
      });
    }

    return configs;
  }
}

export default DeleteRelationshipMutation;
