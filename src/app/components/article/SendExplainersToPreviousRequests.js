import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { graphql, commitMutation, createFragmentContainer } from 'react-relay/compat';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import ConfirmProceedDialog from '../layout/ConfirmProceedDialog';
import Alert from '../cds/alerts-and-prompts/Alert';
import Select from '../cds/inputs/Select';
import CalendarIcon from '../../icons/calendar_month.svg';
import { FlashMessageSetterContext } from '../FlashMessage';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import { getErrorMessage } from '../../helpers';
import styles from './Articles.module.css';

const SendExplainersToPreviousRequests = ({
  explainerItemDbidsToSend,
  onClose,
  onSubmit,
  projectMedia,
}) => {
  const initialRange = Object.keys(projectMedia.ranges).find(key => projectMedia.ranges[key] > 0) || 1; // Default the select to the smallest time window that has a count over 0
  const [range, setRange] = React.useState(parseInt(initialRange, 10)); // 1 day ago, 7 days ago or 30 days ago
  const [count, setCount] = React.useState(projectMedia.ranges[`${initialRange}`]);
  const [sending, setSending] = React.useState(false);
  const setFlashMessage = React.useContext(FlashMessageSetterContext);

  const showAlert = (parseInt(range, 10) !== 1);

  const handleChange = (e) => {
    const { value } = e.target;
    setRange(parseInt(value, 10));
    setCount(projectMedia.ranges[`${value}`]);
  };

  const onCompleted = (response) => {
    if (!response?.sendExplainersToPreviousRequests?.success) {
      setFlashMessage(<GenericUnknownErrorMessage />);
    } else {
      setFlashMessage(
        <FormattedMessage
          defaultMessage="Articles successfully scheduled to be delivered!"
          description="Banner displayed after an article is successfully sent to previous requests."
          id="sendExplainersToPreviousRequests.success"
        />,
        'success');
      onSubmit();
      onClose();
    }
    setSending(false);
  };

  const onError = (error) => {
    const errorMessage = getErrorMessage(error);
    const errorComponent = errorMessage || <GenericUnknownErrorMessage />;
    setFlashMessage(errorComponent);
    setSending(false);
  };

  const callMutationForExplainerItem = (dbid) => {
    const mutation = graphql`
      mutation SendExplainersToPreviousRequestsMutation($input: SendExplainersToPreviousRequestsInput!) {
        sendExplainersToPreviousRequests(input: $input) {
          success
        }
      }
    `;
    commitMutation(Relay.Store, {
      mutation,
      variables: {
        input: {
          dbid,
          range,
        },
      },
      onCompleted,
      onError,
    });
  };

  const handleProceed = () => {
    setSending(true);
    explainerItemDbidsToSend.forEach((dbid) => {
      callMutationForExplainerItem(dbid);
    });
  };

  return (
    <ConfirmProceedDialog
      body={
        <div className={styles.sendExplainersToPreviousRequests}>
          <div className="typography-body1">
            <FormattedHTMLMessage
              defaultMessage="You can deliver new articles to users who have previously submitted requests for this media, but <b>did not</b> receive a response."
              description="Message displayed in the confirmation dialog that appears when sending explainers to previous requests."
              id="sendExplainersToPreviousRequests.intro"
            />
          </div>
          <Select
            helpContent={
              <FormattedHTMLMessage
                defaultMessage="{count, plural, one {Articles will be delivered to  <b>#</b> user who have not received articles} other {Articles will be delivered to <b>#</b> users who have not received articles}}"
                description="Help content for the range select."
                id="sendExplainersToPreviousRequests.selectRangeHelp"
                values={{ count }}
              />
            }
            iconLeft={<CalendarIcon />}
            label={
              <FormattedMessage
                defaultMessage="Send to users who have not received a response"
                description="Label for the range select."
                id="sendExplainersToPreviousRequests.selectRangeLabel"
              />
            }
            value={range}
            onChange={handleChange}
          >
            <FormattedMessage
              defaultMessage="Last: 24 hours"
              description="Label for the 24 hours option in the range select."
              id="sendExplainersToPreviousRequests.oneDay"
            >
              { text => <option value={1}>{text}</option> }
            </FormattedMessage>
            <FormattedMessage
              defaultMessage="Last: 7 days"
              description="Label for the 7 days option in the range select."
              id="sendExplainersToPreviousRequests.sevenDays"
            >
              { text => <option value={7}>{text}</option> }
            </FormattedMessage>
            <FormattedMessage
              defaultMessage="Last: 30 days"
              description="Label for the 30 days option in the range select."
              id="sendExplainersToPreviousRequests.thirtyDays"
            >
              { text => <option value={30}>{text}</option> }
            </FormattedMessage>
          </Select>
          { showAlert && (
            <Alert
              content={
                <FormattedHTMLMessage
                  defaultMessage="Reminder that messages send to users outside of the past 24 hours are considered <u>business initiated conversations</u> and may incur additional charges."
                  description="Message for the alert that is displayed when the selected range is not 24 hours."
                  id="sendExplainersToPreviousRequests.alertContent"
                />
              }
              icon
              placement="default"
              title={
                <FormattedMessage
                  defaultMessage="Business Conversations"
                  description="Business conversations, or Business Initiated Converstaions, are conversations started by messages send to users by the Check partner organization outside when no other message has been sent or recieved in the past 24 hours."
                  id="sendExplainersToPreviousRequests.alertTitle"
                />
              }
              variant="warning"
            />
          )}
        </div>
      }
      cancelLabel={
        <FormattedMessage
          defaultMessage="Cancel"
          description="Generic label for a button or link for a user to press when they wish to abort an in-progress operation"
          id="global.cancel"
        />
      }
      open
      proceedDisabled={count === 0 || explainerItemDbidsToSend.length === 0 || sending}
      proceedLabel={
        <FormattedMessage
          defaultMessage="Send to Previous Requests"
          description="'Send' here is an infinitive verb. Label of the proceed button of the confirmation dialog that appears when sending explainers to previous requests."
          id="sendExplainersToPreviousRequests.proceedLabel"
        />
      }
      title={
        <FormattedMessage
          defaultMessage="Send to Previous Requests?"
          description="Title of the confirmation dialog that appears when sending explainers to previous requests."
          id="sendExplainersToPreviousRequests.title"
        />
      }
      onCancel={onClose}
      onProceed={handleProceed}
    />
  );
};

SendExplainersToPreviousRequests.defaultProps = {
  explainerItemDbidsToSend: [],
};

SendExplainersToPreviousRequests.propTypes = {
  explainerItemDbidsToSend: PropTypes.arrayOf(PropTypes.number),
  projectMedia: PropTypes.shape({
    ranges: PropTypes.exact({
      1: PropTypes.number.isRequired,
      7: PropTypes.number.isRequired,
      30: PropTypes.number.isRequired,
    }),
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

// Used in unit test
// eslint-disable-next-line import/no-unused-modules
export { SendExplainersToPreviousRequests };

export default createFragmentContainer(SendExplainersToPreviousRequests, graphql`
  fragment SendExplainersToPreviousRequests_projectMedia on ProjectMedia {
    ranges: number_of_tipline_requests_that_never_received_articles_by_time
  }
`);
