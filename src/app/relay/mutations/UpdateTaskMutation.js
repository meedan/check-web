import Relay from 'react-relay/classic';

class UpdateTaskMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation updateTask {
      updateTask
    }`;
  }

  getFatQuery() {
    if (this.props.operation === 'answer') {
      switch (this.props.parent_type) {
      case 'project_media':
        return Relay.QL`fragment on UpdateTaskPayload {
          versionEdge,
          task { responses, first_response, first_response_value },
          project_media { last_status, id },
        }`;
      case 'source':
        return Relay.QL`fragment on UpdateTaskPayload { versionEdge, task { responses, first_response, first_response_value }, source { id } }`;
      default:
        return '';
      }
    }

    switch (this.props.parent_type) {
    case 'project_media':
      return Relay.QL`fragment on UpdateTaskPayload {
        task,
        project_media { last_status, log, id },
      }`;
    case 'source':
      return Relay.QL`fragment on UpdateTaskPayload { task { responses, first_response, first_response_value } , source { id } }`;
    default:
      return '';
    }
  }

  getFiles() {
    return { file: this.props.file };
  }

  getOptimisticResponse() {
    if (this.props.operation === 'answer') {
      const { task, user } = this.props;
      const content = [];
      Object.keys(task.fields).forEach((field) => {
        content.push({
          field_name: field,
          value: task.fields[field],
        });
      });

      return {
        task: {
          id: task.id,
          assignments: {
            edges: [],
          },
          first_response: {
            permissions: '{}',
            content: JSON.stringify(content),
            file_data: {},
            attribution: {
              edges: [
                {
                  node: {
                    id: user ? user.id : '',
                    dbid: user ? user.dbid : 0,
                    name: user ? user.name : '',
                    is_active: true,
                    source: {
                      image: user ? user.profile_image : '',
                    },
                    team_user: {
                      user: {
                        id: user ? user.id : '',
                        dbid: user ? user.dbid : 0,
                        name: user ? user.name : '',
                        is_active: true,
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      };
    }
    if (this.props.operation === 'update') {
      const { task } = this.props;
      return { task };
    }
    return {};
  }

  getVariables() {
    const { task } = this.props;
    const params = { id: task.id };
    if (task.annotation_type && task.fields) {
      params.response = JSON.stringify({
        annotation_type: task.annotation_type,
        set_fields: JSON.stringify(task.fields),
      });
    } else if (task.label) {
      params.label = task.label;
      params.description = task.description;
      params.assigned_to_ids = task.assigned_to_ids;
      params.json_schema = task.json_schema;
    }
    return params;
  }

  getConfigs() {
    const fieldIDs = { task: this.props.task.id };
    if (this.props.annotated) {
      if (this.props.parent_type === 'project_media') {
        fieldIDs.project_media = this.props.annotated.id;
      } else if (this.props.parent_type === 'source') {
        fieldIDs.source = this.props.annotated.id;
      }
    }

    const configs = [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs,
      },
    ];
    if (this.props.operation === 'answer') {
      configs.push({
        type: 'RANGE_ADD',
        parentName: this.props.parent_type,
        parentID: this.props.annotated.id,
        connectionName: 'log',
        edgeName: 'versionEdge',
        rangeBehaviors: () => ('prepend'),
      });
    }
    return configs;
  }
}

export default UpdateTaskMutation;
