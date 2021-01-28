import Relay from 'react-relay/classic';
import Task from '../../components/task/Task';

class CreateSourceMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation createSource {
      createSource
    }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on CreateSourcePayload {
        sourceEdge
        project_media {
          source {
            id
            dbid
            image
            name
            medias_count
            permissions
            archived
            updated_at
            account_sources(first: 10000) {
              edges {
                node {
                  id
                  permissions
                  account {
                    id
                    url
                  }
                }
              }
            }
            source_metadata: tasks(fieldset: "metadata", first: 10000) {
              edges {
                node {
                  id,
                  dbid,
                  show_in_browser_extension,
                  ${Task.getFragment('task')},
                }
              }
            }
          }
        }
      }
    `;
  }


  getVariables() {
    const vars = {
      name: this.props.name,
      slogan: this.props.slogan,
      validate_primary_link_exist: this.props.validate_primary_link_exist,
    };
    if (this.props.project_media) {
      vars.add_to_project_media_id = this.props.project_media.dbid;
    }
    if (this.props.urls.length) {
      vars.urls = JSON.stringify(this.props.urls);
    }
    return vars;
  }

  getFiles() {
    return {
      file: this.props.image,
    };
  }

  getConfigs() {
    const fieldIds = {};
    fieldIds.project_media = this.props.project_media.id;
    return [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: fieldIds,
      },
    ];
  }
}

export default CreateSourceMutation;
