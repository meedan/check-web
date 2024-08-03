import Relay from 'react-relay/classic';

class UpdateStatusMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation updateDynamic {
      updateDynamic
    }`;
  }

  getFatQuery() {
    switch (this.props.parent_type) {
    case 'source':
      return Relay.QL`fragment on UpdateDynamicPayload {
        dynamicEdge,
        source {
          id
        }
      }`;
    case 'project_media':
      return Relay.QL`fragment on UpdateDynamicPayload {
        dynamicEdge,
        project_media {
          dbid
          project_id
          log
          id
          last_status
          last_status_obj
          dynamic_annotation_report_design
          fact_check {
            rating
          }
        }
      }`;
    default:
      return '';
    }
  }

  getOptimisticResponse() {
    if (this.props.parent_type === 'project_media') {
      const media = this.props.annotated;
      const optimisticContent = [];
      const obj = {
        project_media: {
          id: media.id,
          last_status: this.props.annotation.status,
          last_status_obj: {
            id: this.props.annotation.status_id,
            content: JSON.stringify(optimisticContent),
          },
          fact_check: {
            rating: this.props.annotation.status,
          },
        },
      };
      return obj;
    }
    return {};
  }

  getVariables() {
    const status = this.props.annotation;
    const vars = { id: status.status_id, locked: status.locked };
    if (status.status) {
      vars.set_fields = JSON.stringify({ verification_status_status: status.status });
    }
    if ('assigned_to_ids' in status) {
      vars.assigned_to_ids = status.assigned_to_ids;
    }
    if ('assignment_message' in status) {
      vars.assignment_message = status.assignment_message;
    }
    return vars;
  }

  getConfigs() {
    const fieldIds = {};
    fieldIds[this.props.parent_type] = this.props.annotated.id;

    return [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: fieldIds,
      },
    ];
  }
}
export default UpdateStatusMutation;
