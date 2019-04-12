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
      current_id: this.props.current.dbid,
      source_id: this.props.target.dbid,
      target_id: this.props.source.dbid,
    };
  }

  getFatQuery() {
    return Relay.QL`fragment on UpdateRelationshipPayload {
      relationship {
        id
        source { id, dbid }
        target { id, dbid }
      }
      current_project_media {
        id
        dbid
        relationships
      }
    }`;
  }

  getOptimisticResponse() {
    return {
      relationship: {
        id: this.props.id,
        source_id: this.props.target.dbid,
        target_id: this.props.source.dbid,
        source: {
          id: this.props.target.id,
          dbid: this.props.target.dbid,
        },
        target: {
          id: this.props.source.id,
          dbid: this.props.source.dbid,
        },
      },
    };
  }

  getConfigs() {
    const ids = {
      relationship: this.props.id,
      current_project_media: this.props.current.id,
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
