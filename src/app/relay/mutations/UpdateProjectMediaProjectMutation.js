import Relay from 'react-relay/classic';

class UpdateProjectMediaProjectMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation updateProjectMediaProject {
      updateProjectMediaProject
    }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on UpdateProjectMediaProjectPayload {
        check_search_project { id, number_of_results },
        project { id, medias_count }
        check_search_project_was { id, number_of_results },
        project_was { id, medias_count }
      }
    `;
  }

  getVariables() {
    const vars = {
      id: this.props.id,
      project_id: this.props.dstProj.dbid,
    };
    if (this.props.srcProj) {
      vars.previous_project_id = this.props.srcProj.dbid;
    }
    return vars;
  }

  getOptimisticResponse() {
    const response = {
      project: {
        id: this.props.dstProj.id,
        medias_count: this.props.dstProj.medias_count + 1,
      },
      check_search_project: {
        id: this.props.dstProj.search_id,
        medias_count: this.props.dstProj.medias_count + 1,
      },
    };
    if (this.props.srcProj) {
      response.project_was = {
        id: this.props.srcProj.id,
        medias_count: this.props.srcProj.medias_count - 1,
      };
      response.check_search_project_was = {
        id: this.props.srcProj.search_id,
        medias_count: this.props.srcProj.medias_count - 1,
      };
    }
    return response;
  }

  getConfigs() {
    const configs = [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: {
          check_search_project: this.props.dstProj.search_id,
          project: this.props.dstProj.id,
        },
      },
    ];
    if (this.props.srcProj) {
      configs[0].fieldIDs.check_search_project_was = this.props.srcProj.search_id;
      configs[0].fieldIDs.project_was = this.props.srcProj.id;
    }
    return configs;
  }

  static fragments = {
    srcProj: () => Relay.QL`
      fragment on Project {
        id
        dbid
        search_id
        medias_count
      }
    `,
    dstProj: () => Relay.QL`
      fragment on Project {
        id
        dbid
        search_id
        medias_count
      }
    `,
  };
}

export default UpdateProjectMediaProjectMutation;
