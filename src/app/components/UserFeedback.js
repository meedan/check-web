import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Dismiss from 'material-ui/svg-icons/content/clear';
import styled from 'styled-components';
import FaceFrown from '../../assets/images/feedback/face-frown';
import FaceNeutral from '../../assets/images/feedback/face-neutral';
import FaceSmile from '../../assets/images/feedback/face-smile';
import CheckContext from '../CheckContext';
import { request } from '../redux/actions';
import { units, checkBlue, black54, black10 } from '../styles/js/shared';
import { mapGlobalMessage } from './MappedMessage';

const styles = {
  faces: {
    paddingTop: units(2),
    paddingBottom: units(2),
    display: 'flex',
    justifyContent: 'space-around',
  },
};

const StyledCardHeader = styled(CardHeader)`
  .user-feedback__mui-card-header {
    font-size: medium;
  }
  .user-feedback__mui-card-action {
    margin-top: 0;
  }
`;

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

  handleDismiss = () => {
    window.storage.set('last-feedback-date', new Date());
    this.forceUpdate();
  };

  handleExplainMore = () => {
    const feedbackForm = 'https://docs.google.com/forms/d/e/1FAIpQLSd9QWfJpsRZX0xYib0Pld-1ccr2DZ_3JMdoeZ8dxqk1lLq-ag/viewform';
    window.open(feedbackForm);
  };

  handleSubmitRating() {
    if (this.state.value) {
      const { token } = this.getContext().currentUser;
      const endpoint = 'log';
      const onSuccess = () => {
        this.setState({ value: null, resolved: true });
        window.storage.set('last-feedback-date', new Date());
      };
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

    const lastFeedbackDate = window.storage.getValue('last-feedback-date');
    const now = new Date();
    const thirtyDaysAgo = new Date(new Date().setDate(now.getDate() - 30));

    if (new Date(thirtyDaysAgo) < new Date(lastFeedbackDate)) {
      return null;
    }

    return (
      <div>
        <Divider />
        <StyledCardHeader
          style={{ padding: `0 ${units(2)}` }}
          classes={{
            title: 'user-feedback__mui-card-header',
            action: 'user-feedback__mui-card-action',
          }}
          title={this.state.resolved ?
            <FormattedMessage
              id="UserFeedback.thanks"
              defaultMessage="Thanks for your feedback!"
            /> :
            <FormattedMessage
              id="UserFeedback.label"
              defaultMessage="How likely are you to recommend {appName}?"
              values={{ appName: mapGlobalMessage(this.props.intl, 'appNameHuman') }}
            />
          }
          action={<IconButton onClick={this.handleDismiss}><Dismiss /></IconButton>}
        />

        <CardContent style={{ padding: `0 ${units(2)}` }}>
          <div style={styles.faces}>
            <Tooltip
              placement="top"
              title={<FormattedMessage
                id="UserFeedback.unlikely"
                defaultMessage="Unlikely"
              />}
            >
              <IconButton
                disabled={this.state.resolved}
                onClick={() => this.handleClickRating('unlikely')}
              >
                <FaceFrown color={frownColor} />
              </IconButton>
            </Tooltip>

            <Tooltip
              placement="top"
              title={<FormattedMessage
                id="UserFeedback.maybe"
                defaultMessage="Maybe"
              />}
            >
              <IconButton
                disabled={this.state.resolved}
                onClick={() => this.handleClickRating('maybe')}
              >
                <FaceNeutral color={neutralColor} />
              </IconButton>
            </Tooltip>

            <Tooltip
              placement="top"
              title={<FormattedMessage
                id="UserFeedback.likely"
                defaultMessage="Likely"
              />}
            >
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
              variant="contained"
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
      </div>
    );
  }
}

UserFeedback.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(UserFeedback);
