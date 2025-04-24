import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames/bind';
import WebhookDelete from './WebhookDelete';
import { WebhookEditContainer } from './WebhookEdit';
import TextField from '../cds/inputs/TextField';
import { safelyParseJSON } from '../../helpers';
import styles from './ApiKeys.module.css';

const WebhookEntry = ({ webhook }) => {
  const parsedEvents = safelyParseJSON(webhook.events);
  const selectedEvent = parsedEvents && parsedEvents.length > 0 ? parsedEvents[0].event : null;

  console.log('webhook', webhook); // eslint-disable-line no-console
  console.log('parsedEvents', parsedEvents); // eslint-disable-line no-console
  console.log('selectedEvent', selectedEvent); // eslint-disable-line no-console
  return (
    <div className={cx('api-key', styles['apikey-entry-root'])}>
      <div className={`typography-subtitle2 ${styles['key-title']}`}>
        <span>
          {webhook.name}
        </span>
      </div>
      <div className={`typography-body2 ${styles['key-description']}`}><strong>{webhook.request_url}</strong></div>
      <div className={styles['key-row']}>
        <TextField
          className={cx('api-key__textfield', styles['key-textfield'])}
          disabled
          label={
            <FormattedMessage
              defaultMessage="Listening for"
              description="Label for text field that shows the event selected for notifying the webhook"
              id="webhookEntry.listeningFor"
            />
          }
          readOnly
          value={selectedEvent}
        />
        <div className={styles['key-row__buttons']}>
          <WebhookEditContainer webhook={webhook} />
          <WebhookDelete webhookId={webhook.id} />
        </div>
      </div>
    </div>
  );
};

WebhookEntry.propTypes = {
  webhook: PropTypes.shape({
    name: PropTypes.string.isRequired,
    events: PropTypes.string.isRequired,
    request_url: PropTypes.string.isRequired,
  }).isRequired,
};


export { WebhookEntry }; // eslint-disable-line import/no-unused-modules
export default createFragmentContainer(WebhookEntry, graphql`
  fragment WebhookEntry_webhook on Webhook {
    id
    name
    events
    request_url
    ...WebhookEditContainer_webhook
  }
`);
