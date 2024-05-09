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
  onDismiss,
  projectMedia,
  setFlashMessage,
  container,
  onSave,
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
        onCompleted: ({ response, error }) => {
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
        onCompleted: ({ response, error }) => {
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
      className={dialogStyles['dialog-window']}
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onDismiss}
      container={container}
    >
      <div className={dialogStyles['dialog-content']}>
        <div className={inputStyles['form-fieldset']} style={{ color: !enableSwitch && (formError === 'no_switch_enabled') ? 'red' : null }}>
          <SwitchComponent
            className={inputStyles['form-fieldset-field']}
            checked={enableSwitch}
            onChange={() => handleSwitch(!enableSwitch)}
            labelPlacement="end"
            label={<FormattedMessage
              id="sensitiveContentMenuButton.enableSwitch"
              defaultMessage="Enable content warning"
              description="Switch to enable sensitive content screen"
            />}
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
                  tagName="strong"
                  id="sensitiveContentMenuButton.selectCategory"
                  defaultMessage="Select a category"
                  description="Header for sensitive content types"
                />
              </div>
              <FormControlLabel
                value="adult"
                control={<Radio />}
                label={<FormattedMessage
                  id="sensitiveContentMenuButton.adult"
                  defaultMessage="Adult (nudity, pornographic)"
                  description="Label for adult content type"
                />}
              />
              <FormControlLabel
                value="medical"
                control={<Radio />}
                label={<FormattedMessage
                  id="sensitiveContentMenuButton.medical"
                  defaultMessage="Medical conditions/procedures"
                  description="Label for medical content type"
                />}
              />
              <FormControlLabel
                value="violence"
                control={<Radio />}
                label={<FormattedMessage
                  id="sensitiveContentMenuButton.violence"
                  defaultMessage="Violence"
                  description="Label for violence content type"
                />}
              />
              <FormControlLabel
                value="other"
                control={<Radio />}
                label={(
                  <FormattedMessage
                    id="sensitiveContentMenuButton.typeOther"
                    defaultMessage="Type other"
                    description="Label for other content type"
                  >
                    { placeholder => (
                      <LimitedTextArea
                        className={inputStyles['form-fieldset-field']}
                        required={Boolean(false)}
                        value={customType || ''}
                        maxChars={48}
                        maxLength="48"
                        rows={1}
                        maxHeight="48px"
                        autoGrow="false"
                        placeholder={placeholder}
                        error={(
                          formError &&
                          contentType === 'other' &&
                          !customType
                        )}
                        onBlur={handleChangeCustom}
                      />
                    )}
                  </FormattedMessage>
                )}
              />
            </RadioGroup>
          </>
        }
      </div>
      <div className={dialogStyles['dialog-actions']}>
        <ButtonMain
          size="default"
          variant="text"
          theme="lightText"
          onClick={onDismiss}
          label={
            <FormattedMessage id="global.cancel" defaultMessage="Cancel" description="Generic label for a button or link for a user to press when they wish to abort an in-progress operation" />
          }
        />
        <ButtonMain
          size="default"
          variant="contained"
          theme="brand"
          onClick={submitFlagAnnotation}
          label={
            <FormattedMessage id="global.save" defaultMessage="Save" description="Generic label for a button or link for a user to press when they wish to save an action or setting" />
          }
        />
      </div>
    </Popover>
  );
};

const SensitiveContentMenuButton = ({
  currentUserRole,
  projectMedia,
  onSave,
  setFlashMessage,
}) => {
  const { show_warning_cover } = projectMedia;
  const [anchorEl, setAnchorEl] = React.useState();
  const containerRef = React.useRef(null);

  return (
    <div ref={containerRef}>
      <ButtonMain
        theme="black"
        size="default"
        variant="contained"
        disabled={(
          show_warning_cover &&
          currentUserRole !== 'admin' &&
          currentUserRole !== 'editor'
        )}
        onClick={e => setAnchorEl(e.currentTarget)}
        iconCenter={<VisibilityOffIcon />}
      />
      <SensitiveContentMenu
        key={anchorEl}
        anchorEl={anchorEl}
        onDismiss={() => setAnchorEl(null)}
        onSave={onSave}
        projectMedia={projectMedia}
        setFlashMessage={setFlashMessage}
        container={containerRef.current}
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
