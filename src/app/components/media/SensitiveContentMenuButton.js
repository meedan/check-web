import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { graphql, createFragmentContainer, commitMutation } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import {
  FormControlLabel,
  Popover,
  Radio,
  RadioGroup,
} from '@material-ui/core';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import LimitedTextArea from '../layout/inputs/LimitedTextArea';
import SwitchComponent from '../cds/inputs/SwitchComponent';
import { withSetFlashMessage } from '../FlashMessage';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import { getErrorMessage } from '../../helpers';
import VisibilityOffIcon from '../../icons/visibility_off.svg';
import dialogStyles from '../../styles/css/dialog.module.css';
import inputStyles from '../../styles/css/inputs.module.css';

const SensitiveContentMenu = ({
  anchorEl,
  container,
  onDismiss,
  onSave,
  projectMedia,
  setFlashMessage,
}) => {
  let warningType = null;
  let warningTypeCustom = null;

  const {
    dynamic_annotation_flag,
    show_warning_cover,
  } = projectMedia;

  if (dynamic_annotation_flag && show_warning_cover) {
    // Sort by flag category likelihood and display most likely
    let sortable = [];
    // Put custom flag at beginning of array
    if (dynamic_annotation_flag.data.custom) {
      sortable = sortable.concat([...Object.entries(dynamic_annotation_flag.data.custom)]);
    }
    const filteredFlags = {};
    ['adult', 'medical', 'violence'].forEach((key) => { filteredFlags[key] = dynamic_annotation_flag.data.flags[key]; });
    sortable = sortable.concat([...Object.entries(filteredFlags)]);
    sortable.sort((a, b) => b[1] - a[1]);
    const type = sortable[0];
    [warningType] = type;

    if (
      warningType !== 'adult' &&
      warningType !== 'medical' &&
      warningType !== 'violence'
    ) {
      warningTypeCustom = warningType;
      warningType = 'other';
    }
  }

  const [enableSwitch, setEnableSwitch] = React.useState(show_warning_cover);
  const [contentType, setContentType] = React.useState(warningType);
  const [customType, setCustomType] = React.useState(warningTypeCustom);
  const [formError, setFormError] = React.useState(null);

  const handleSwitch = (inputChecked) => {
    setEnableSwitch(inputChecked);
    if (!inputChecked) {
      setContentType(null);
      setCustomType('');
    }
  };

  const handleSetContentType = (value) => {
    setContentType(value);
    setCustomType('');
  };

  const handleChangeCustom = (e) => {
    setContentType('other');
    setCustomType(e.target.value);
  };

  const submitFlagAnnotation = () => {
    const onFailure = (error) => {
      const message = getErrorMessage(error, <GenericUnknownErrorMessage />);
      setFlashMessage(message, 'error');
    };
    const onSuccess = () => {
      onDismiss();
      onSave(enableSwitch);
    };

    if (enableSwitch && !contentType) {
      setFormError('no_warning_type');
      return;
    }
    if (contentType && !enableSwitch) {
      setFormError('no_switch_enabled');
      return;
    }
    if (contentType === 'other' && !customType) {
      setFormError('no_custom_type');
      return;
    }

    const fields = {
      show_cover: enableSwitch,
      custom: {},
    };

    if (contentType !== 'other') {
      fields.flags = {
        adult: contentType === 'adult' ? 7 : 0,
        spoof: 0,
        medical: contentType === 'medical' ? 7 : 0,
        violence: contentType === 'violence' ? 7 : 0,
        racy: 0,
        spam: 0,
      };
    } else {
      fields.custom[customType] = 7;
      fields.flags = {
        adult: 0,
        spoof: 0,
        medical: 0,
        violence: 0,
        racy: 0,
        spam: 0,
      };
    }

    if (!dynamic_annotation_flag) {
      commitMutation(Relay.Store, {
        mutation: graphql`
          mutation SensitiveContentMenuButtonCreateDynamicAnnotationFlagMutation($input: CreateDynamicAnnotationFlagInput!) {
            createDynamicAnnotationFlag(input: $input) {
              project_media {
                id
                show_warning_cover
                dynamic_annotation_flag {
                  id
                  dbid
                  content
                  data
                  annotator {
                    name
                  }
                }
              }
            }
          }
        `,
        variables: {
          input: {
            annotated_id: projectMedia.dbid.toString(),
            annotated_type: 'ProjectMedia',
            set_fields: JSON.stringify(fields),
          },
        },
        onCompleted: ({ error, response }) => {
          if (error) {
            return onFailure(error);
          }
          return onSuccess(response);
        },
        onError: onFailure,
      });
    } else {
      commitMutation(Relay.Store, {
        mutation: graphql`
          mutation SensitiveContentMenuButtonUpdateDynamicAnnotationFlagMutation($input: UpdateDynamicAnnotationFlagInput!) {
            updateDynamicAnnotationFlag(input: $input) {
              project_media {
                id
                show_warning_cover
                dynamic_annotation_flag {
                  id
                  dbid
                  content
                  data
                  annotator {
                    name
                  }
                }
              }
            }
          }
        `,
        variables: {
          input: {
            id: dynamic_annotation_flag.id,
            set_fields: JSON.stringify(fields),
          },
        },
        onCompleted: ({ error, response }) => {
          if (error) {
            return onFailure(error);
          }
          return onSuccess(response);
        },
        onError: onFailure,
      });
    }
  };

  return (
    <Popover
      anchorEl={anchorEl}
      className={dialogStyles['dialog-window']}
      container={container}
      open={Boolean(anchorEl)}
      onClose={onDismiss}
    >
      <div className={dialogStyles['dialog-content']}>
        <div className={inputStyles['form-fieldset']} style={{ color: !enableSwitch && (formError === 'no_switch_enabled') ? 'red' : null }}>
          <SwitchComponent
            checked={enableSwitch}
            className={inputStyles['form-fieldset-field']}
            label={<FormattedMessage
              defaultMessage="Enable content warning"
              description="Switch to enable sensitive content screen"
              id="sensitiveContentMenuButton.enableSwitch"
            />}
            labelPlacement="end"
            onChange={() => handleSwitch(!enableSwitch)}
          />
        </div>
        { enableSwitch &&
          <>
            <RadioGroup
              className={inputStyles['form-fieldset']}
              name="select-sensitive-content-type"
              value={contentType}
              onChange={e => handleSetContentType(e.target.value)}
            >
              <div className={inputStyles['form-fieldset-title']} style={{ color: formError === 'no_warning_type' ? 'red' : null }}>
                <FormattedMessage
                  defaultMessage="Select a category"
                  description="Header for sensitive content types"
                  id="sensitiveContentMenuButton.selectCategory"
                  tagName="strong"
                />
              </div>
              <FormControlLabel
                control={<Radio />}
                label={<FormattedMessage
                  defaultMessage="Adult (nudity, pornographic)"
                  description="Label for adult content type"
                  id="sensitiveContentMenuButton.adult"
                />}
                value="adult"
              />
              <FormControlLabel
                control={<Radio />}
                label={<FormattedMessage
                  defaultMessage="Medical conditions/procedures"
                  description="Label for medical content type"
                  id="sensitiveContentMenuButton.medical"
                />}
                value="medical"
              />
              <FormControlLabel
                control={<Radio />}
                label={<FormattedMessage
                  defaultMessage="Violence"
                  description="Label for violence content type"
                  id="sensitiveContentMenuButton.violence"
                />}
                value="violence"
              />
              <FormControlLabel
                control={<Radio />}
                label={(
                  <FormattedMessage
                    defaultMessage="Type other"
                    description="Label for other content type"
                    id="sensitiveContentMenuButton.typeOther"
                  >
                    { placeholder => (
                      <LimitedTextArea
                        autoGrow="false"
                        className={inputStyles['form-fieldset-field']}
                        error={(
                          formError &&
                          contentType === 'other' &&
                          !customType
                        )}
                        maxChars={48}
                        maxHeight="48px"
                        maxLength="48"
                        placeholder={placeholder}
                        required={Boolean(false)}
                        rows={1}
                        value={customType || ''}
                        onBlur={handleChangeCustom}
                      />
                    )}
                  </FormattedMessage>
                )}
                value="other"
              />
            </RadioGroup>
          </>
        }
      </div>
      <div className={dialogStyles['dialog-actions']}>
        <ButtonMain
          label={
            <FormattedMessage defaultMessage="Cancel" description="Generic label for a button or link for a user to press when they wish to abort an in-progress operation" id="global.cancel" />
          }
          size="default"
          theme="lightText"
          variant="text"
          onClick={onDismiss}
        />
        <ButtonMain
          label={
            <FormattedMessage defaultMessage="Save" description="Generic label for a button or link for a user to press when they wish to save an action or setting" id="global.save" />
          }
          size="default"
          theme="info"
          variant="contained"
          onClick={submitFlagAnnotation}
        />
      </div>
    </Popover>
  );
};

const SensitiveContentMenuButton = ({
  currentUserRole,
  onSave,
  projectMedia,
  setFlashMessage,
}) => {
  const { show_warning_cover } = projectMedia;
  const [anchorEl, setAnchorEl] = React.useState();
  const containerRef = React.useRef(null);

  return (
    <div ref={containerRef}>
      <ButtonMain
        disabled={(
          show_warning_cover &&
          currentUserRole !== 'admin' &&
          currentUserRole !== 'editor'
        )}
        iconCenter={<VisibilityOffIcon />}
        size="default"
        theme="black"
        variant="contained"
        onClick={e => setAnchorEl(e.currentTarget)}
      />
      <SensitiveContentMenu
        anchorEl={anchorEl}
        container={containerRef.current}
        key={anchorEl}
        projectMedia={projectMedia}
        setFlashMessage={setFlashMessage}
        onDismiss={() => setAnchorEl(null)}
        onSave={onSave}
      />
    </div>
  );
};

SensitiveContentMenuButton.defaultProps = {
  onSave: () => {},
};

SensitiveContentMenuButton.propTypes = {
  currentUserRole: PropTypes.string.isRequired,
  projectMedia: PropTypes.shape({
    dbid: PropTypes.number.isRequired,
    show_warning_cover: PropTypes.bool.isRequired,
  }).isRequired,
  setFlashMessage: PropTypes.func.isRequired,
  onSave: PropTypes.func,
};

export default createFragmentContainer(withSetFlashMessage(SensitiveContentMenuButton), graphql`
  fragment SensitiveContentMenuButton_projectMedia on ProjectMedia {
    dbid
    show_warning_cover
  }
`);
