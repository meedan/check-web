import Relay from 'react-relay/classic';

class GenerateTwoFactorBackupCodesMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation { generateTwoFactorBackupCodes }`;
  }

  getFatQuery() {
    return Relay.QL`fragment on GenerateTwoFactorBackupCodesPayload { success, codes }`;
  }

  getConfigs() {
    return [{
      type: 'REQUIRED_CHILDREN',
      children: [Relay.QL`
        fragment on GenerateTwoFactorBackupCodesPayload {
          success
          codes
        }
      `],
    }];
  }

  getVariables() {
    return {
      id: this.props.id,
    };
  }
}

export default GenerateTwoFactorBackupCodesMutation;
