/* eslint-disable relay/unused-fields, react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { graphql, commitMutation, createFragmentContainer } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import LinkifyIt from 'linkify-it';
import cx from 'classnames/bind';
import SourcePicture from './SourcePicture';
import TextField from '../cds/inputs/TextField';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import AddIcon from '../../icons/add.svg';
import SetSourceDialog from '../media/SetSourceDialog';
import { can } from '../Can';
import TimeBefore from '../TimeBefore';
import { urlFromSearchQuery } from '../search/Search';
import Tasks from '../task/Tasks';
import CheckError from '../../CheckError';
import {
  getErrorMessage,
  getErrorMessageForRelayModernProblem,
  getErrorObjectsForRelayModernProblem,
  parseStringUnixTimestamp,
} from '../../helpers';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import inputStyles from '../../styles/css/inputs.module.css';
import styles from '../media/media.module.css';

function commitCreateAccountSource({
  onFailure, onSuccess, source, url,
}) {
  const accountSources = source.account_sources ? source.account_sources.edges : [];
  const newAccountSources = accountSources.concat({ node: { account: { url, metadata: '' } } });
  const optimisticResponse = {
    createAccountSource: {
      account_sources: {
        newAccountSources,
      },
    },
  };
  commitMutation(Relay.Store, {
    mutation: graphql`
      mutation SourceInfoCreateAccountSourceMutation($input: CreateAccountSourceInput!) {
        createAccountSource(input: $input) {
          source {
            id
            name
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
          }
        }
      }
    `,
    optimisticResponse,
    variables: {
      input: {
        source_id: source.dbid,
        url,
      },
    },
    onError: onFailure,
    onCompleted: ({ data, errors }) => {
      if (errors) {
        return onFailure(errors);
      }
      return onSuccess(data);
    },
  });
}

function commitDeleteAccountSource({ asId, source }) {
  const onFailure = () => {};
  const onSuccess = () => {};
  commitMutation(Relay.Store, {
    mutation: graphql`
      mutation SourceInfoDeleteAccountSourceMutation($input: DestroyAccountSourceInput!) {
        destroyAccountSource(input: $input) {
          deletedId
          source {
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
          }
        }
      }
    `,
    variables: {
      input: {
        id: asId,
      },
    },
    configs: [
      {
        type: 'NODE_DELETE',
        parentName: 'source',
        parentID: source.id,
        connectionName: 'account_sources',
        deletedIDFieldName: 'deletedId',
      },
    ],
    onError: onFailure,
    onCompleted: ({ data, errors }) => {
      if (errors) {
        return onFailure(errors);
      }
      return onSuccess(data);
    },
  });
}

function SourceInfo({
  about,
  onChangeClick,
  projectMediaPermissions,
  relateToExistingSource,
  source,
  team,
}) {
  const [sourceName, setSourceName] = React.useState(source.name);
  const [sourceError, setSourceError] = React.useState('');
  const [secondaryUrl, setSecondaryUrl] = React.useState({ url: '', error: '', addNewLink: false });
  const [primaryUrl, setPrimaryUrl] = React.useState({ url: '', error: '' });
  const [saving, setSaving] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [existingSource, setExistingSource] = React.useState({});

  const handleRemoveLink = (asId) => {
    commitDeleteAccountSource({ source, asId });
  };

  const handleChangeLink = (e, type) => {
    const newLink = { url: e.target.value, error: '' };
    if (type === 'primary') {
      setPrimaryUrl(newLink);
    } else {
      newLink.addNewLink = true;
      setSecondaryUrl(newLink);
    }
  };

  const handleChangeSourceName = () => {
    if (sourceName && source.name !== sourceName) {
      const onFailure = (errors) => {
        setSaving(false);
        const error = getErrorObjectsForRelayModernProblem(errors);
        if (Array.isArray(error) && error.length > 0) {
          if (error[0].code === CheckError.codes.DUPLICATED) {
            setDialogOpen(true);
            setExistingSource(error[0].data);
          } else {
            const message = getErrorMessageForRelayModernProblem(errors) || <GenericUnknownErrorMessage />;
            setSourceError(message);
          }
        }
      };

      const onSuccess = () => {
        setSourceError('');
      };

      setSaving(true);

      commitMutation(Relay.Store, {
        mutation: graphql`
          mutation SourceInfoUpdateNameMutation($input: UpdateSourceInput!) {
            updateSource(input: $input) {
              source {
                name
                updated_at
              }
            }
          }
        `,
        variables: {
          input: {
            id: source.id,
            name: sourceName,
          },
        },
        onError: onFailure,
        onCompleted: ({ data, errors }) => {
          setSaving(false);
          if (errors) {
            return onFailure(errors);
          }
          return onSuccess(data);
        },
      });
    }
  };

  const handleNameKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleChangeSourceName();
    }
  };

  const handleAddLinkFail = (type, message) => {
    const newLink = { error: message };
    newLink.url = type === 'primary' ? primaryUrl.url : secondaryUrl.url;
    if (type === 'primary') {
      setPrimaryUrl(newLink);
    } else {
      newLink.addNewLink = secondaryUrl.addNewLink;
      setSecondaryUrl(newLink);
    }
  };

  const createAccountSource = (e, type) => {
    let value = e.target.value.trim().toLowerCase();
    if (!value) {
      return;
    }
    if (!/^https?:\/\//.test(value)) {
      value = `http://${value}`; // Pender will turn into HTTPS if available
    }
    const linkify = new LinkifyIt();
    const validateUrl = linkify.match(value);
    if (Array.isArray(validateUrl) && validateUrl[0] && validateUrl[0].url) {
      const { url } = validateUrl[0];
      const onFailure = (transaction) => {
        setSaving(false);
        const message = getErrorMessage(transaction, <GenericUnknownErrorMessage />);
        handleAddLinkFail(type, message);
      };
      const onSuccess = () => {
        setSaving(false);
        if (type === 'primary') {
          setPrimaryUrl({ url: '', error: '' });
        } else {
          setSecondaryUrl({ url: '', error: '', addNewLink: false });
        }
      };
      setSaving(true);
      commitCreateAccountSource({
        source, url, onSuccess, onFailure,
      });
    } else {
      const message = (
        <FormattedMessage
          defaultMessage="Please enter a valid URL"
          description="Error message for invalid link"
          id="sourceInfo.invalidLink"
        />
      );
      handleAddLinkFail(type, message);
    }
  };

  const handleCancelDialog = () => {
    setDialogOpen(false);
    setSourceName(source.name);
  };

  const handleSubmitDialog = () => {
    relateToExistingSource({ dbid: existingSource.id });
  };

  const accountSources = source.account_sources.edges;
  const mainAccount = accountSources[0];
  const secondaryAccounts = accountSources.slice(1);
  const sourceMediasLink = urlFromSearchQuery({ sources: [`${source.dbid}`] }, `/${team.slug}/all-items`);
  const { source_metadata } = source;
  const sourceMetadata = source_metadata ? source_metadata.edges : [];

  return (
    <div id={`source-${source.dbid}`}>
      <div className={inputStyles['form-inner-wrapper']}>
        <div className={styles['media-sources-header']}>
          <div className={styles['media-sources-header-left']}>
            <SourcePicture
              className="source__avatar"
              object={source}
              type="user"
            />
            <div className={styles['media-sources-title']}>
              <h6 className="source__name">
                {sourceName}
              </h6>
              <a className="typography-caption" href={sourceMediasLink} rel="noopener noreferrer" target="_blank">
                <FormattedMessage
                  defaultMessage="{mediasCount, plural, one {1 item} other {# items}}"
                  description="show source media counts"
                  id="sourceInfo.mediasCount"
                  values={{
                    mediasCount: source.medias_count || 0,
                  }}
                />
              </a>
            </div>
          </div>
          <div className={styles['media-sources-header-right']}>
            { can(projectMediaPermissions, 'update ProjectMedia') ?
              <ButtonMain
                buttonProps={{
                  id: 'media-source-change',
                }}
                label={
                  <FormattedMessage
                    defaultMessage="Change"
                    description="allow user to change a project media source"
                    id="mediaSource.changeSource"
                  />
                }
                size="default"
                theme="info"
                variant="contained"
                onClick={onChangeClick}
              /> : null
            }
            <div className="typography-caption">
              { saving ?
                <FormattedMessage
                  defaultMessage="Saving…"
                  description="Progress message about a save in progress"
                  id="sourceInfo.saving"
                /> :
                <FormattedMessage
                  defaultMessage="Saved {ago}"
                  description="Caption value for how long ago a save occurred"
                  id="sourceInfo.saved"
                  values={{
                    ago: <TimeBefore date={parseStringUnixTimestamp(source.updated_at)} />,
                  }}
                />
              }
            </div>
          </div>
        </div>
        <div className={inputStyles['form-inner-wrapper']}>
          <div className={inputStyles['form-fieldset']}>
            <div
              className={cx('source__card-card', inputStyles['form-fieldset-field'])}
              id={`source__card-${source.dbid}`}
            >
              <TextField
                componentProps={{
                  id: 'source__name-input',
                  name: 'source__name-input',
                }}
                disabled={!can(source.permissions, 'update Source') || saving}
                error={Boolean(sourceError)}
                helpContent={sourceError}
                label={
                  <FormattedMessage
                    defaultMessage="Main name"
                    description="Source name"
                    id="sourceInfo.mainName"
                  />
                }
                value={sourceName}
                onBlur={handleChangeSourceName}
                onChange={(e) => { setSourceName(e.target.value); }}
                onKeyPress={(e) => { handleNameKeyPress(e); }}
              />
              {dialogOpen ?
                <SetSourceDialog
                  open={dialogOpen}
                  sourceName={existingSource.name}
                  onCancel={handleCancelDialog}
                  onSubmit={handleSubmitDialog}
                /> : null
              }
            </div>
            <div className="source__card-card" id={`source-accounts-${source.dbid}`}>
              { mainAccount ?
                <div className={cx('source__url', inputStyles['form-fieldset-field'])} key={mainAccount.node.id}>
                  <TextField
                    className={inputStyles['textfield-removable-input']}
                    componentProps={{
                      id: 'main_source__link',
                    }}
                    disabled
                    label={
                      <FormattedMessage
                        defaultMessage="Main source URL"
                        description="URL for first account related to media source"
                        id="sourceInfo.mainAccount"
                      />
                    }
                    value={mainAccount.node.account.url}
                    onRemove={can(mainAccount.node.permissions, 'destroy AccountSource') ? () => handleRemoveLink(mainAccount.node.id) : null}
                  />
                </div> : null }
              { !mainAccount && can(source.permissions, 'create Account') ?
                <div className={inputStyles['form-fieldset-field']}>
                  <TextField
                    componentProps={{
                      id: 'source_primary__link-input',
                      name: 'source_primary__link-input',
                    }}
                    disabled={saving}
                    error={Boolean(primaryUrl.error)}
                    helpContent={primaryUrl.error}
                    label={
                      <FormattedMessage
                        defaultMessage="Main source URL"
                        description="Allow user to add a main source URL"
                        id="sourceInfo.primaryLink"
                      />
                    }
                    placeholder="http(s)://"
                    value={primaryUrl.url}
                    onBlur={(e) => { createAccountSource(e); }}
                    onChange={(e) => { handleChangeLink(e, 'primary'); }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        createAccountSource(e, 'primary');
                      }
                    }}
                  />
                </div> : null
              }
              { secondaryAccounts.length === 0 ?
                null :
                <div className={inputStyles['form-fieldset-title']}>
                  <FormattedMessage
                    defaultMessage="Secondary source URLs"
                    description="URLs for source accounts except first account"
                    id="sourceInfo.secondaryAccounts"
                  />
                </div>
              }
              { secondaryAccounts.map((as, index) => (
                <div className={cx('source__url', inputStyles['form-fieldset-field'])} key={as.node.id}>
                  <TextField
                    className={inputStyles['textfield-removable-input']}
                    componentProps={{
                      id: `source__link-item${index.toString()}`,
                    }}
                    defaultValue={as.node.account.url}
                    disabled
                    label={
                      <FormattedMessage
                        defaultMessage="Secondary source URL"
                        description="URL for secondary account related to media source"
                        id="sourceInfo.secondaryUrl"
                      />
                    }
                    onRemove={can(as.node.permissions, 'destroy AccountSource') ? () => handleRemoveLink(as.node.id) : null}
                  />
                </div>
              ))}
              { secondaryUrl.addNewLink ?
                <div className={cx('source__url-input', inputStyles['form-fieldset-field'])} key="source-add-new-link">
                  <TextField
                    className={inputStyles['textfield-removable-input']}
                    componentProps={{
                      id: 'source__link-input-new',
                      name: 'source__link-input-new',
                    }}
                    disabled={saving}
                    error={Boolean(secondaryUrl.error)}
                    helpContent={secondaryUrl.error}
                    label={
                      <FormattedMessage
                        defaultMessage="Secondary source URL"
                        description="URL for secondary account related to media source"
                        id="sourceInfo.secondaryUrl"
                      />
                    }
                    placeholder="http(s)://"
                    value={secondaryUrl.url}
                    onBlur={(e) => { createAccountSource(e); }}
                    onChange={(e) => { handleChangeLink(e, 'secondary'); }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        createAccountSource(e, 'secondary');
                      }
                    }}
                    onRemove={() => { setSecondaryUrl({ url: '', error: '', addNewLink: false }); }}
                  />
                </div> : null
              }
              { can(source.permissions, 'create Account') && Boolean(secondaryUrl.addNewLink || mainAccount || primaryUrl.error) ?
                <div className={inputStyles['form-footer-actions']}>
                  <ButtonMain
                    className="source__add-link-button"
                    disabled={Boolean(secondaryUrl.addNewLink || !mainAccount || primaryUrl.error)}
                    iconLeft={<AddIcon />}
                    label={
                      <FormattedMessage
                        defaultMessage="Add a secondary URL"
                        description="Allow user to relate a new link to media source"
                        id="sourceInfo.addLink"
                      />
                    }
                    size="default"
                    theme="text"
                    variant="contained"
                    onClick={() => { setSecondaryUrl({ url: '', error: '', addNewLink: true }); }}
                  />
                </div> : null
              }
            </div>
          </div>
        </div>
      </div>
      <Tasks about={about} media={source} tasks={sourceMetadata} />
    </div>
  );
}

SourceInfo.propTypes = {
  about: PropTypes.object.isRequired, // GraphQL "About" object
  team: PropTypes.object.isRequired, // GraphQL "Team" object (current team)
  source: PropTypes.object.isRequired, // GraphQL "Source" object
  projectMediaPermissions: PropTypes.object.isRequired, // ProjectMedia permissions
  onChangeClick: PropTypes.func.isRequired, // func(<SourceId>) => undefined
  relateToExistingSource: PropTypes.func.isRequired,
};

export default createFragmentContainer(SourceInfo, {
  about: graphql`
    fragment SourceInfo_about on About {
      upload_max_size
      upload_extensions
      video_max_size
      video_extensions
      audio_max_size
      audio_extensions
      file_max_size
      file_max_size_in_bytes
      file_extensions
      upload_max_dimensions
      upload_min_dimensions
    }
  `,
  source: graphql`
    fragment SourceInfo_source on Source
    @argumentDefinitions(teamSlug: { type: "String!"}) {
      id
      dbid
      image
      name
      pusher_channel
      medias_count
      permissions
      updated_at
      archived
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
            id
            dbid
            show_in_browser_extension
            label
            type
            annotated_type
            description
            fieldset
            permissions
            jsonoptions
            json_schema
            options
            team_task {
              conditional_info
            }
            team_task_id
            responses(first: 10000) {
              edges {
                node {
                  id,
                  dbid,
                  permissions,
                  content,
                  file_data,
                  attribution(first: 10000) {
                    edges {
                      node {
                        id
                        dbid
                        name
                        source {
                          id
                          dbid
                          image
                        }
                      }
                    }
                  }
                  annotator {
                    name,
                    profile_image,
                    user {
                      id,
                      dbid,
                      name,
                      is_active
                      source {
                        id,
                        dbid,
                        image,
                      }
                    }
                  }
                }
              }
            }
            assignments(first: 10000) {
              edges {
                node {
                  name
                  id
                  dbid
                  source {
                    id
                    dbid
                    image
                  }
                }
              }
            }
            first_response_value
            first_response {
              id,
              dbid,
              permissions,
              content,
              file_data,
              attribution(first: 10000) {
                edges {
                  node {
                    id
                    dbid
                    name
                    source {
                      id
                      dbid
                      image
                    }
                  }
                }
              }
              annotator {
                name,
                profile_image,
                user {
                  id,
                  dbid,
                  name,
                  is_active
                  source {
                    id,
                    dbid,
                    image,
                  }
                }
              }
            }
          }
        }
      }
    }
  `,
});
