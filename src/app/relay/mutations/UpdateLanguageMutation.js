import Relay from 'react-relay/classic';

class UpdateLanguageMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation updateDynamicAnnotationLanguage {
      updateDynamicAnnotationLanguage
    }`;
  }

  getFatQuery() {
    return Relay.QL`fragment on UpdateDynamicAnnotationLanguagePayload {
      project_media {
        id
        language
        language_code
      }
    }`;
  }

  getOptimisticResponse() {
    return {
      project_media: {
        id: this.props.projectMediaId,
        language: this.props.languageName,
        language_code: this.props.languageCode,
      },
    };
  }

  getVariables() {
    return {
      id: this.props.id,
      set_fields: JSON.stringify({ language: this.props.languageCode }),
    };
  }

  getConfigs() {
    return [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: {
          project_media: this.props.projectMediaId,
        },
      },
    ];
  }
}

export default UpdateLanguageMutation;
