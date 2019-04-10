import Relay from 'react-relay/classic';

class UpdateRelationshipMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation updateRelationship {
      updateRelationship
    }`;
  }

  getVariables() {
    return {
      id: this.props.id,
      source_id: this.props.target.dbid,
      target_id: this.props.source.dbid,
    };
  }

  getFatQuery() {
    return Relay.QL`fragment on UpdateRelationshipPayload {
      relationship { id, dbid, source, target, source_id, target_id }
      relationshipEdge
      source_project_media { dbid, relationship, relationships { sources, targets, targets_count, sources_count } }
      target_project_media { dbid, relationship, relationships { sources, targets, targets_count, sources_count } }
    }`;
  }

  getOptimisticResponse() {
    return {
      source_project_media: {
        id: this.props.target.id, relationships: { targets_count: 1, sources_count: 0 },
      },
      target_project_media: {
        id: this.props.source.id, relationships: { targets_count: 0, sources_count: 1 },
      },
    };
  }

  getConfigs() {
    const ids = {
      relationship: this.props.id,
      source_project_media: this.props.target.id,
      target_project_media: this.props.source.id,
    };

    return [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: ids,
      },
    ];
  }
}

export default UpdateRelationshipMutation;
