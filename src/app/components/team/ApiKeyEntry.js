import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage, FormattedDate } from 'react-intl';
import CopyToClipboard from 'react-copy-to-clipboard';
import cx from 'classnames/bind';
import ApiKeyDelete from './ApiKeyDelete';
import { FlashMessageSetterContext } from '../FlashMessage';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import TextField from '../cds/inputs/TextField';
import BulletSeparator from '../layout/BulletSeparator';
import ContentCopyIcon from '../../icons/content_copy.svg';
import ErrorOutlineIcon from '../../icons/error_outline.svg';
import styles from './ApiKeys.module.css';

const ApiKeyEntry = ({ apiKey }) => {
  const setFlashMessage = React.useContext(FlashMessageSetterContext);

  const handleCopyToClipboard = () => {
    setFlashMessage((
      <FormattedMessage
        id="apiKeyEntry.copiedToClipboard"
        defaultMessage="The API Key has been copied to the clipboard"
        description="success message fro when an API Key has been copied to the clipboard"
      />
    ), 'success');
  };

  const expired = new Date(apiKey.expire_at) < new Date();

  return (
    <div className={cx('api-key', styles['apikey-entry-root'])}>
      <div className={`typography-subtitle2 ${styles['key-title']}`}>
        { expired && <ErrorOutlineIcon className={styles['key-expired']} /> }
        { expired && (
          <span className={styles['key-expired']}>
            <FormattedMessage
              id="apiKeyEntry.expiredTitle"
              defaultMessage="Expired:"
              description="Prefix to the name of an expired API key"
            />
          </span>
        )}
        <span className={styles[`key-title--${expired ? 'expired' : 'active'}`]}>
          {apiKey.title}
        </span>
      </div>
      <div className={`typography-body2 ${styles['key-description']}`}><strong>{apiKey.description}</strong></div>
      <div className={styles['key-row']}>
        <TextField
          className={cx('api-key__textfield', styles['key-textfield'])}
          label={
            <FormattedMessage
              id="apiKeyEntry.apiKeyTitle"
              defaultMessage="API Key"
              description="Label for Text field that shows the API key token"
            />
          }
          value={apiKey.access_token}
          disabled={expired}
          readOnly
        />
        <div className={styles['key-row__buttons']}>
          <CopyToClipboard text={apiKey.access_token} onCopy={handleCopyToClipboard}>
            <ButtonMain
              className="api-key__copy-button"
              theme="text"
              variant="outlined"
              iconLeft={<ContentCopyIcon />}
              label={
                <FormattedMessage
                  id="apiKeyEntry.copy"
                  defaultMessage="Copy"
                  description="Label for button that will copy the API key token to the clipboard"
                />
              }
              disabled={expired}
            />
          </CopyToClipboard>
          <ApiKeyDelete keyId={apiKey.id} />
        </div>
      </div>
      <BulletSeparator
        caption
        details={[
          <FormattedMessage
            id="apiKeyEntry.addedBy"
            defaultMessage="Added on {date} by {user}"
            description="Details when API key was created and by which user"
            values={{
              date: <FormattedDate value={apiKey.created_at * 1000} day="numeric" month="short" year="numeric" />,
              user: apiKey.user?.name,
            }}
          />,
          expired ? (
            <span className={styles['key-expired']}>
              <FormattedMessage
                id="apiKeyEntry.expiredDate"
                defaultMessage="Expired: {date}"
                description="Expiry date of the API key"
                values={{
                  date: <FormattedDate value={apiKey.expire_at} day="numeric" month="short" year="numeric" />,
                }}
              />
            </span>
          ) : (
            <FormattedMessage
              id="apiKeyEntry.expiryDate"
              defaultMessage="Expires: {date}"
              description="Expiry date of the API key"
              values={{
                date: <FormattedDate value={apiKey.expire_at} day="numeric" month="short" year="numeric" />,
              }}
            />
          ),
          <FormattedMessage
            id="apiKeyEntry.role"
            defaultMessage="Role: Editor" // There's no role field to ApiKeyType yet
            description="Details role (access level) of the API key"
          />,
        ]}
      />
    </div>
  );
};

ApiKeyEntry.propTypes = {
  apiKey: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    access_token: PropTypes.string.isRequired,
    created_at: PropTypes.string.isRequired,
    expire_at: PropTypes.string.isRequired,
    user: PropTypes.shape({
      name: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export { ApiKeyEntry }; // eslint-disable-line import/no-unused-modules
export default createFragmentContainer(ApiKeyEntry, graphql`
  fragment ApiKeyEntry_apiKey on ApiKey {
    id
    title
    description
    access_token
    created_at
    expire_at
    user {
      name
    }
  }
`);
