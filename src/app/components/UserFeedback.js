import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from 'material-ui-next/Button';
import Card, { CardContent } from 'material-ui-next/Card';
import IconButton from 'material-ui-next/IconButton';
import Tooltip from 'material-ui-next/Tooltip';
// import Dismiss from 'material-ui/svg-icons/content/clear';
import FaceFrown from '../../assets/images/feedback/face-frown';
import FaceNeutral from '../../assets/images/feedback/face-neutral';
import FaceSmile from '../../assets/images/feedback/face-smile';
import CheckContext from '../CheckContext';
import { request } from '../redux/actions';
import { units, checkBlue, black54, black10 } from '../styles/js/shared';

const styles = {
  faces: {
    paddingTop: units(2),
    paddingBottom: units(2),
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
  },
};

class UserFeedback extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: null,
    };
  }

  getContext() {
    return new CheckContext(this).getContextStore();
  }

  handleClickRating(value) {
    if (this.state.value === value) {
      this.setState({ value: null });
    } else {
      this.setState({ value });
    }
  }

  handleExplainMore = () => {
    const feedbackForm = 'https://docs.google.com/forms/d/e/1FAIpQLSd9QWfJpsRZX0xYib0Pld-1ccr2DZ_3JMdoeZ8dxqk1lLq-ag/viewform';
    window.open(feedbackForm);
  };

  handleSubmitRating() {
    if (this.state.value) {
      const { token } = this.getContext().currentUser;
      const endpoint = 'log';
      const onSuccess = () => { this.setState({ value: null, resolved: true }); };
      const onFailure = () => { };
      const data = {};
      data.recommendCheck = this.state.value;
      const headers = {};
      headers['X-Check-Token'] = token;

      request('post', endpoint, onFailure, onSuccess, data, headers);
    }
  }

  render() {
    let frownColor = this.state.resolved ? black10 : black54;
    let neutralColor = this.state.resolved ? black10 : black54;
    let smileColor = this.state.resolved ? black10 : black54;

    frownColor = this.state.value === 'unlikely' ? checkBlue : frownColor;
    neutralColor = this.state.value === 'maybe' ? checkBlue : neutralColor;
    smileColor = this.state.value === 'likely' ? checkBlue : smileColor;

    return (
      <Card>
        <CardContent>
          { /* <IconButton style={{ float: 'right' }}><Dismiss /></IconButton> */ }
          <div className="user-feedback__label">
            { this.state.resolved ?
              <FormattedMessage
                id="UserFeedback.thanks"
                defaultMessage="Thanks for your feedback!"
              /> :
              <FormattedMessage
                id="UserFeedback.label"
                defaultMessage="How likely are you to recommend Check?"
              />
            }
          </div>
          <div style={styles.faces}>
            <Tooltip title="Unlikely" placement="top">
              <IconButton
                disabled={this.state.resolved}
                onClick={() => this.handleClickRating('unlikely')}
              >
                <FaceFrown color={frownColor} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Maybe" placement="top">
              <IconButton
                disabled={this.state.resolved}
                onClick={() => this.handleClickRating('maybe')}
              >
                <FaceNeutral color={neutralColor} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Likely" placement="top">
              <IconButton
                disabled={this.state.resolved}
                onClick={() => this.handleClickRating('likely')}
              >
                <FaceSmile color={smileColor} />
              </IconButton>
            </Tooltip>
          </div>
          { this.state.value ?
            <Button
              className="user-feedback__save-button"
              variant="raised"
              color="primary"
              fullWidth
              onClick={this.handleSubmitRating.bind(this)}
            >
              <FormattedMessage id="UserFeedback.save" defaultMessage="Save" />
            </Button> : null
          }
          { this.state.resolved ?
            <Button
              className="user-feedback__explain-more-button"
              color="primary"
              fullWidth
              onClick={this.handleExplainMore}
            >
              <FormattedMessage id="UserFeedback.explainMore" defaultMessage="Explain More" />
            </Button> : null
          }
        </CardContent>
      </Card>
    );
  }
}

UserFeedback.contextTypes = {
  store: PropTypes.object,
};

export default UserFeedback;
