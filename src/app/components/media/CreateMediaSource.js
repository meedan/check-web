/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import LinkifyIt from 'linkify-it';
import cx from 'classnames/bind';
import SetSourceDialog from './SetSourceDialog';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import TextField from '../cds/inputs/TextField';
import AddIcon from '../../icons/add.svg';
import Alert from '../cds/alerts-and-prompts/Alert';
import CreateSourceMutation from '../../relay/mutations/CreateSourceMutation';
import SourcePicture from '../source/SourcePicture';
import { getErrorObjects, getErrorMessage } from '../../helpers';
import CheckError from '../../CheckError';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import inputStyles from '../../styles/css/inputs.module.css';
import styles from '../media/media.module.css';

function CreateMediaSource({
  media,
  name,
  onCancel,
  relateToExistingSource,
}) {
  const [sourceName, setSourceName] = React.useState(name || '');
  const [primaryUrl, setPrimaryUrl] = React.useState({ url: '', error: '' });
  const [submitDisabled, setSubmitDisabled] = React.useState(!name);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [validatePrimaryLinkExist, setValidatePrimaryLinkExist] = React.useState(true);
  const [links, setLinks] = React.useState([]);
  const [message, setMessage] = React.useState(null);
  const [existingSource, setExistingSource] = React.useState({});

  const handleChangeLink = (e, index) => {
    const newLinks = links.slice();
    newLinks[index].url = e.target.value;
    newLinks[index].error = '';
    setLinks(newLinks);
  };

  const handleChangeName = (e) => {
    const submitDisabledValue = e.target.value.length === 0;
    setSourceName(e.target.value);
    setSubmitDisabled(submitDisabledValue);
  };

  const handleRemoveNewLink = (index) => {
    const newLinks = links.slice();
    newLinks.splice(index, 1);
    setLinks(newLinks);
  };

  const handleAddLink = () => {
    const newLinks = links.slice();
    newLinks.push({ url: '', error: '' });
    setLinks(newLinks);
  };

  const validatePrimaryLink = () => {
    const linkify = new LinkifyIt();
    if (primaryUrl.url.trim()) {
      if (!/^https?:\/\//.test(primaryUrl.url)) {
        primaryUrl.url = `http://${primaryUrl.url}`; // Pender will turn into HTTPS if available
      }
      const validateUrl = linkify.match(primaryUrl.url);
      if (Array.isArray(validateUrl) && validateUrl[0] && validateUrl[0].url) {
        return true;
      }
      const error = (
        <FormattedMessage
          defaultMessage="Please enter a valid URL"
          description="Error message for invalid link"
          id="sourceInfo.invalidLink"
        />
      );
      setPrimaryUrl({ url: primaryUrl.url, error });
      return false;
    }
    return true;
  };

  const validateLinks = () => {
    const linkify = new LinkifyIt();

    let success = true;

    const newLinks = links.slice().filter(link => !!link.url.trim()).map((link) => {
      let { url } = link;
      if (!/^https?:\/\//.test(link)) {
        url = `http://${url}`; // Pender will turn into HTTPS if available
      }
      return { ...link, url };
    });

    newLinks.forEach((item_) => {
      const item = item_;
      const url = linkify.match(item.url);
      if (Array.isArray(url) && url[0] && url[0].url) {
        item.url = url[0].url;
      } else {
        item.error = (
          <FormattedMessage
            defaultMessage="Please enter a valid URL"
            description="Error message for invalid link"
            id="sourceInfo.invalidLink"
          />
        );
        success = false;
      }
    });

    setLinks(newLinks);
    return success;
  };

  const handleCancelOrSave = () => {
    onCancel();
  };

  const handleCancelDialog = () => {
    setDialogOpen(false);
    setValidatePrimaryLinkExist(false);
  };

  const handleSubmitDialog = () => {
    relateToExistingSource({ dbid: existingSource.id });
  };

  const handleSave = () => {
    if (!submitDisabled && validateLinks() && validatePrimaryLink()) {
      setSubmitDisabled(true);
      const urls = [];
      let newLinks = [primaryUrl].concat(links);
      newLinks = newLinks.filter(link => !!link.url.trim());
      newLinks.forEach((link) => {
        urls.push(link.url);
      });

      const onFailure = (transaction) => {
        setSubmitDisabled(false);
        const error = getErrorObjects(transaction);
        if (Array.isArray(error) && error.length > 0) {
          if (error[0].code === CheckError.codes.DUPLICATED) {
            setDialogOpen(true);
            setExistingSource(error[0].data);
          } else {
            const messageError = getErrorMessage(transaction, <GenericUnknownErrorMessage />);
            setMessage(messageError);
          }
        }
      };

      const onSuccess = () => {
        handleCancelOrSave();
      };

      Relay.Store.commitUpdate(
        new CreateSourceMutation({
          name: sourceName,
          slogan: sourceName,
          urls,
          validate_primary_link_exist: validatePrimaryLinkExist,
          project_media: media,
        }),
        { onSuccess, onFailure },
      );
    }
    return true;
  };

  return (
    <React.Fragment>
      { message && <><Alert contained title={message} variant="error" /><br /></> }
      <div className={inputStyles['form-inner-wrapper']}>
        <div className={styles['media-sources-header']}>
          <div className={styles['media-sources-header-left']}>
            <SourcePicture
              className="source__avatar"
              type="user"
            />
            <div className={styles['media-sources-title']}>
              <h6 className="source__name">
                {sourceName.length !== 0 ?
                  sourceName :
                  <FormattedMessage
                    defaultMessage="Create new"
                    description="Create a new media source label"
                    id="sourceInfo.createNew"
                  />
                }
              </h6>
              <span className="typography-caption">
                <FormattedMessage
                  defaultMessage="{mediasCount, plural, one {1 item} other {# items}}"
                  description="show source media counts"
                  id="sourceInfo.mediasCount"
                  values={{
                    mediasCount: 0,
                  }}
                />
              </span>
            </div>
          </div>
        </div>
        <div className={inputStyles['form-inner-wrapper']}>
          <div className={inputStyles['form-fieldset']}>
            <FormattedMessage
              defaultMessage="Add a name for this source"
              description="placeholder for create source name"
              id="sourceInfo.sourceNamePlaceholder"
            >
              { placeholder => (
                <TextField
                  className={inputStyles['form-fieldset-field']}
                  componentProps={{
                    id: 'source__name-input',
                    name: 'source__name-input',
                  }}
                  defaultValue={sourceName}
                  label={
                    <FormattedMessage
                      defaultMessage="Main Source Name"
                      description="label for create source name"
                      id="sourceInfo.sourceName"
                    />
                  }
                  placeholder={placeholder}
                  required
                  onChange={e => handleChangeName(e)}
                />
              )}
            </FormattedMessage>
            <FormattedMessage
              defaultMessage="Add a main URL for this source"
              description="placeholder for create source main url"
              id="sourceInfo.primaryLinkPlaceholder"
            >
              { placeholder => (
                <TextField
                  className={inputStyles['form-fieldset-field']}
                  componentProps={{
                    id: 'source_primary__link-input',
                    name: 'source_primary__link-input',
                  }}
                  defaultValue={primaryUrl.url ? primaryUrl.url.replace(/^https?:\/\//, '') : ''}
                  error={Boolean(primaryUrl.error)}
                  helpContent={primaryUrl.error}
                  label={
                    <FormattedMessage
                      defaultMessage="Main source URL"
                      description="Allow user to add a main source URL"
                      id="sourceInfo.primaryLink"
                    />
                  }
                  placeholder={placeholder}
                  onChange={(e) => { setPrimaryUrl({ url: e.target.value, error: '' }); }}
                />
              )}
            </FormattedMessage>
            { links.length === 0 ?
              null :
              <div className={inputStyles['form-fieldset-title']}>
                <FormattedMessage
                  defaultMessage="Secondary source URLs"
                  description="URLs for source accounts except first account"
                  id="sourceInfo.secondaryAccounts"
                />
              </div>
            }
            { links.map((link, index) => (
              <div
                className={cx('source__url-input', inputStyles['form-fieldset-field'])}
                // eslint-disable-next-line react/no-array-index-key
                key={index.toString()}
              >
                <TextField
                  componentProps={{
                    id: `source__link-input${index.toString()}`,
                    name: `source__link-input${index.toString()}`,
                  }}
                  defaultValue={link.url ? link.url.replace(/^https?:\/\//, '') : ''}
                  error={Boolean(link.error)}
                  helpContent={link.error}
                  label={
                    <FormattedMessage
                      defaultMessage="Add a secondary URL"
                      description="Label for add a new source secondary URL"
                      id="sourceInfo.addSecondaryLink"
                    />
                  }
                  placeholder="http(s)://"
                  onChange={(e) => { handleChangeLink(e, index); }}
                  onRemove={() => handleRemoveNewLink(index)}
                />
              </div>
            ))}
            <div className={inputStyles['form-footer-actions']}>
              <ButtonMain
                iconLeft={<AddIcon />}
                label={
                  <FormattedMessage
                    defaultMessage="Add a secondary URL"
                    description="allow user to relate a new link to media source"
                    id="sourceInfo.addLink"
                  />
                }
                size="default"
                theme="text"
                variant="contained"
                onClick={() => handleAddLink()}
              />
            </div>
          </div>
        </div>
        <div className={inputStyles['form-footer-actions']}>
          <ButtonMain
            className="source__edit-cancel-button"
            label={
              <FormattedMessage defaultMessage="Cancel" description="Generic label for a button or link for a user to press when they wish to abort an in-progress operation" id="global.cancel" />
            }
            size="default"
            theme="lightText"
            variant="text"
            onClick={handleCancelOrSave}
          />
          <ButtonMain
            className="source__edit-save-button"
            disabled={submitDisabled}
            label={
              <FormattedMessage
                defaultMessage="Create source"
                description="Label for button to create a new source"
                id="createMediaSource.createSource"
              />
            }
            size="default"
            theme="info"
            variant="contained"
            onClick={handleSave}
          />
        </div>
      </div>
      {dialogOpen ?
        <SetSourceDialog
          open={dialogOpen}
          primaryUrl={primaryUrl.url}
          sourceName={existingSource.name}
          onCancel={handleCancelDialog}
          onSubmit={handleSubmitDialog}
        /> : null
      }
    </React.Fragment>
  );
}

CreateMediaSource.defaultProps = {
  name: '',
};

CreateMediaSource.propTypes = {
  media: PropTypes.object.isRequired,
  onCancel: PropTypes.func.isRequired,
  relateToExistingSource: PropTypes.func.isRequired,
  name: PropTypes.string,
};

export default CreateMediaSource;
