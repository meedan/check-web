import React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from 'material-ui-next/Button';

class UserFeedback extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: null,
    };
  }

  render() {
    return (
      <div>
        <div className="user-feedback__label">
          <FormattedMessage
            id="UserFeedback.label"
            defaultMessage="How likely are you to recommend Check?"
          />
        </div>
        { this.state.value }
        <Button
          className="user-feedback__save-button"
          variant="raised"
          color="primary"
          fullWidth
        >
          <FormattedMessage id="UserFeedback.save" defaultMessage="Save" />
        </Button>
      </div>
    );
  }
}

export default UserFeedback;
