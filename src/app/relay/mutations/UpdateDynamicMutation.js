import Relay from 'react-relay/classic';

class UpdateDynamicMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation updateDynamic {
      updateDynamic
    }`;
  }

  getFatQuery() {
    const { task } = this.props;
    switch (this.props.parent_type) {
    case 'source':
      return Relay.QL`fragment on UpdateDynamicPayload {
        dynamicEdge,
        source {
          id,
          tasks,
        }
      }`;
    case 'project_media':
      return Relay.QL`fragment on UpdateDynamicPayload {
        dynamicEdge,
        project_media {
          tasks,
          log,
          id,
        }
      }`;
    case 'task':
      if (task.annotated_type === 'Source') {
        return Relay.QL`fragment on UpdateDynamicPayload {
          task { id, first_response, responses, first_response_value }
          source { id }
        }`;
      }
      return Relay.QL`fragment on UpdateDynamicPayload {
        task { id, first_response, responses, first_response_value }
        project_media { id, log }
      }`;
    default:
      return '';
    }
  }

  getFiles() {
    if (this.props.file) {
      return { 'file[]': this.props.file };
    }
    return {};
  }

  getOptimisticResponse() {
    if (this.props.parent_type === 'task') {
      const { dynamic, task } = this.props;
      const content = [];
      Object.keys(dynamic.fields).forEach((field) => {
        content.push({
          field_name: field,
          value: dynamic.fields[field],
        });
      });

      return {
        task: {
          id: task.id,
          first_response: {
            permissions: '{}',
            content: JSON.stringify(content),
          },
        },
      };
    }
    return {};
  }

  getVariables() {
    const { dynamic } = this.props;
    const vars = { id: dynamic.id };
    if (dynamic.fields) {
      vars.set_fields = JSON.stringify(dynamic.fields);
    }
    if (dynamic.set_attribution) {
      vars.set_attribution = dynamic.set_attribution;
    }
    if (Object.prototype.hasOwnProperty.call(dynamic, 'lock_version')) {
      vars.lock_version = dynamic.lock_version;
    }
    return vars;
  }

  getConfigs() {
    const fieldIds = {};

    const { task } = this.props;
    if (this.props.parent_type === 'task') {
      fieldIds.task = this.props.task.id;
      if (task.annotated_type === 'Source') {
        fieldIds.source = this.props.annotated.id;
      } else {
        fieldIds.project_media = this.props.annotated.id;
      }
    } else {
      fieldIds[this.props.parent_type] = this.props.annotated.id;
    }

    return [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: fieldIds,
      },
    ];
  }
}

export default UpdateDynamicMutation;
