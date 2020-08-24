import Relay from 'react-relay/classic';

class UpdateTaskMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation updateTask {
      updateTask
    }`;
  }

  getFatQuery() {
    if (this.props.operation === 'answer') {
      return Relay.QL`fragment on UpdateTaskPayload {
        versionEdge
        task {
          responses
          first_response
        },
        project_media {
          last_status,
          id,
          log_count
        },
      }`;
    }
    return Relay.QL`fragment on UpdateTaskPayload {
      task,
      project_media {
        last_status,
        log,
        id,
        log_count
      },
    }`;
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
            image_data: {},
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
    if (task.accept_suggestion) {
      params.accept_suggestion = task.accept_suggestion;
    } else if (task.reject_suggestion) {
      params.reject_suggestion = task.reject_suggestion;
    } else if (task.annotation_type && task.fields) {
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
      fieldIDs.project_media = this.props.annotated.id;
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
        parentName: 'project_media',
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
