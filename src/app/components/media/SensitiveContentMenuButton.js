import React from 'react';
import { FormattedMessage } from 'react-intl';
import Relay from 'react-relay/classic';
import { graphql, commitMutation } from 'react-relay/compat';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Popover from '@material-ui/core/Popover';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import { withSetFlashMessage } from '../FlashMessage';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import { getErrorMessage } from '../../helpers';
import globalStrings from '../../globalStrings';

const SensitiveContentMenuButton = ({
  currentUserRole,
  projectMedia,
  setFlashMessage,
}) => {
  let warningType = null;

  if (projectMedia.dynamic_annotation_flag) {
    // Sort by flag category likelihood and display most likely
    let sortable = [];
    // Put custom flag at beginning of array
    if (projectMedia.dynamic_annotation_flag.data.custom) {
      sortable = sortable.concat([...Object.entries(projectMedia.dynamic_annotation_flag.data.custom)]);
    }
    sortable = sortable.concat([...Object.entries(projectMedia.dynamic_annotation_flag.data.flags)]);
    sortable.sort((a, b) => b[1] - a[1]);
    const type = sortable[0];
    [warningType] = type;
  }

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [enableSwitch, setEnableSwitch] = React.useState(projectMedia.show_warning_cover);
  const [contentType, setContentType] = React.useState((
    warningType === 'adult' ||
    warningType === 'medical' ||
    warningType === 'violence' ?
      warningType : 'other'
  ));
  const [customType, setCustomType] = React.useState((
    warningType !== 'adult' &&
    warningType !== 'medical' &&
    warningType !== 'violence' ?
      warningType : null
  ));
  const [formError, setFormError] = React.useState(null);

  const handleCancel = () => {
    setFormError(null);
    setAnchorEl(null);
  };

  const handleSwitch = (e, inputChecked) => {
    setEnableSwitch(inputChecked);
  };

  const handleSetContentType = (value) => {
    setContentType(value);
    setCustomType(null);
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
    const onSuccess = () => { setAnchorEl(null); };

    if (!contentType) {
      setFormError('no_warning_type');
      return;
    } else if (contentType === 'other' && !customType) {
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

    if (!projectMedia.dynamic_annotation_flag) {
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
            id: projectMedia.dynamic_annotation_flag.id,
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
    <React.Fragment>
      <Button
        disabled={(
          projectMedia.show_warning_cover &&
          currentUserRole !== 'admin' &&
          currentUserRole !== 'editor'
        )}
        startIcon={<VisibilityOffIcon />}
        onClick={e => setAnchorEl(e.currentTarget)}
      >
        <FormattedMessage
          id="sensitiveContentMenuButton.contentWarning"
          defaultMessage="Content warning"
          description="Button that pops sensitive content screen settings"
        />
      </Button>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
      >
        <Box p={2}>
          <Box>
            <Switch checked={enableSwitch} onChange={handleSwitch} />
            <FormattedMessage
              id="sensitiveContentMenuButton.enableSwitch"
              defaultMessage="Enable content warning"
              description="Switch to enable sensitive content screen"
            />
          </Box>
          <Box
            my={2}
            fontWeight="bold"
            color={formError === 'no_warning_type' ? 'red' : null}
          >
            <FormattedMessage
              id="sensitiveContentMenuButton.selectCategory"
              defaultMessage="Select a category"
              description="Header for sensitive content types"
            />
          </Box>
          <RadioGroup
            name="select-sensitive-content-type"
            value={contentType}
            onChange={e => handleSetContentType(e.target.value)}
          >
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
                  { label => (
                    <TextField
                      label={label}
                      error={formError === 'no_custom_type'}
                      value={customType}
                      onChange={handleChangeCustom}
                      variant="outlined"
                      size="small"
                      fullWidth
                    />
                  )}
                </FormattedMessage>
              )}
            />
          </RadioGroup>
          <Box mt={2} display="flex" justifyContent="flex-end">
            <Button onClick={handleCancel}>
              <FormattedMessage {...globalStrings.cancel} />
            </Button>
            <Button
              color="primary"
              onClick={submitFlagAnnotation}
              variant="contained"
            >
              <FormattedMessage {...globalStrings.save} />
            </Button>
          </Box>
        </Box>
      </Popover>
    </React.Fragment>
  );
};

// TODO createFragmentContainer
export default withSetFlashMessage(SensitiveContentMenuButton);
