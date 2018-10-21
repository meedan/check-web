import Relay from 'react-relay/classic';

class UpdateTaskMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation updateTask {
      updateTask
    }`;
  }

  getFatQuery() {
    return Relay.QL`fragment on UpdateTaskPayload {
      task,
      project_media {
        translation_statuses,
        verification_statuses,
        last_status,
        last_status_obj,
        log,
        id,
        log_count,
        field_value(annotation_type_field_name: "translation_status:translation_status_status"),
        translation_status: annotation(annotation_type: "translation_status")
      },
    }`;
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
      params.required = task.required;
      params.assigned_to_ids = task.assigned_to_ids;
    }
    return params;
  }

  getConfigs() {
    const fieldIDs = { task: this.props.task.id };
    if (this.props.annotated) {
      fieldIDs.project_media = this.props.annotated.id;
    }
    return [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs,
      },
    ];
  }
}

export default UpdateTaskMutation;
