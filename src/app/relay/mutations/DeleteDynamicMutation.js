import Relay from 'react-relay/classic';

class DeleteDynamicMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation destroyDynamic {
      destroyDynamic
    }`;
  }

  static fragments = {
    annotation: () => Relay.QL`fragment on Annotation { id }`,
  };

  getVariables() {
    return { id: this.props.id };
  }

  getFatQuery() {
    switch (this.props.parent_type) {
    case 'task':
      return Relay.QL`fragment on DestroyDynamicPayload { deletedId, task { id, first_response, first_response_value, responses } }`;
    default:
      return Relay.QL`fragment on DestroyDynamicPayload { deletedId }`;
    }
  }

  getOptimisticResponse() {
    if (this.props.parent_type === 'task') {
      return {
        deletedId: this.props.id,
        task: {
          id: this.props.annotated.id,
          assignments: { edges: [] },
          first_response: null,
        },
      };
    }
    return {};
  }

  getConfigs() {
    const fieldIds = {};
    fieldIds[this.props.parent_type] = this.props.annotated.id;

    const config = [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: fieldIds,
      },
    ];

    if (this.props.parent_type === 'task') {
      config.push({
        type: 'NODE_DELETE',
        parentName: 'task',
        parentID: this.props.annotated.id,
        connectionName: 'responses',
        deletedIDFieldName: 'deletedId',
      });
    }

    if (this.props.parent_type === 'project_media') {
      config.push({
        type: 'NODE_DELETE',
        parentName: this.props.parent_type,
        parentID: this.props.annotated.id,
        connectionName: 'annotations',
        deletedIDFieldName: 'deletedId',
      });
    }

    return config;
  }
}

export default DeleteDynamicMutation;
