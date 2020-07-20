import Relay from 'react-relay/classic';

class BulkCreateProjectMediaProjectsMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation createProjectMediaProjects {
      createProjectMediaProjects
    }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on CreateProjectMediaProjectsPayload {
        project {
          id
          medias_count
        }
      }
    `;
  }

  getOptimisticResponse() {
    return {
      project: {
        id: this.props.project.id,
        medias_count: this.props.project.medias_count + this.props.projectMediaDbids.length,
      },
    };
  }

  getVariables() {
    const inputs = this.props.projectMediaDbids.map(projectMediaDbid => (
      { project_media_id: projectMediaDbid, project_id: this.props.project.dbid }
    ));
    return { inputs };
  }

  getConfigs() {
    return [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: { project: this.props.project.id },
      },
    ];
  }

  static fragments = {
    project: () => Relay.QL`
      fragment on Project {
        id
        dbid
        medias_count
      }
    `,
  };
}

export default BulkCreateProjectMediaProjectsMutation;
