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
      return Relay.QL`fragment on UpdateDynamicPayload { dynamicEdge, source { log, log_count, id } }`;
    case 'project_media':
      return Relay.QL`fragment on UpdateDynamicPayload { dynamicEdge, project_media { targets, log, id, last_status, last_status_obj, log_count } }`;
    default:
      return '';
    }
  }

  getOptimisticResponse() {
    if (this.props.parent_type === 'project_media') {
      const media = this.props.annotated;
      let smoochBotInstalled = false;
      if (media.team && media.team.team_bot_installations) {
        media.team.team_bot_installations.edges.forEach((edge) => {
          if (edge.node.team_bot.identifier === 'smooch') {
            smoochBotInstalled = true;
          }
        });
      }
      const obj = {
        project_media: {
          id: media.id,
          last_status: this.props.annotation.status,
          last_status_obj: {
            id: this.props.annotation.status_id,
          },
        },
      };
      if (smoochBotInstalled && media.targets && media.targets.edges.length > 0) {
        const targets = [];
        media.targets.edges.forEach((target) => {
          const node = {
            id: target.node.id,
            last_status: this.props.annotation.status,
          };
          targets.push({ node });
        });
        obj.project_media.targets = { edges: targets };
      }
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
