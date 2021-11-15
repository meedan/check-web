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
import globalStrings from '../../globalStrings';

const SensitiveContentMenuButton = ({ projectMedia }) => {
  const [anchorEl, setAnchorEl] = React.useState(false);
  const [enableSwitch, setEnableSwitch] = React.useState(projectMedia.show_warning_cover);

  const contentType = 'adult';

  const handleSwitch = (e, inputChecked) => {
    console.log('handleSwitch');
    console.log('e', e);
    console.log('inputChecked', inputChecked);
    setEnableSwitch(inputChecked);
  };

  const handleSetContentType = () => {};

  const submitFlagAnnotation = () => {
    const onFailure = () => {};
    const onSuccess = () => {};
    console.log('submitFlagAnnotation');

    if (!projectMedia.dynamic_annotation_flag) {
      console.log('submitFlagAnnotation :: CREATE');

      commitMutation(Relay.Store, {
        mutation: graphql`
          mutation SensitiveContentMenuButtonCreateDynamicAnnotationFlagMutation($input: CreateDynamicAnnotationFlagInput!) {
            createDynamicAnnotationFlag(input: $input) {
              project_media {
                id
                show_warning_cover
                dynamic_annotation_flag {
                  id
                }
              }
            }
          }
        `,
        variables: {
          input: {
            annotated_id: projectMedia.dbid.toString(),
            annotated_type: 'ProjectMedia',
            set_fields: JSON.stringify({
              flags: {
                adult: 3,
                spoof: 2,
                medical: 0,
                violence: 0,
                racy: 0,
                spam: 0,
              },
              show_cover: enableSwitch,
            }),
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
      console.log('submitFlagAnnotation :: UPDATE');
    }
  };

  return (
    <React.Fragment>
      <Button
        startIcon={<VisibilityOffIcon />}
        onClick={e => setAnchorEl(e.currentTarget)}
      >
        {anchorEl ? 'hello' : (
          <FormattedMessage
            id="sensitiveContentMenuButton.contentWarning"
            defaultMessage="Content warning"
            description="Button that pops sensitive content screen settings"
          />
        )}
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
          <Box my={2} fontWeight="bold">
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
              label={<FormattedMessage
                id="sensitiveContentMenuButton.typeOther"
                defaultMessage="Type other"
                description="Label for other content type"
              />}
            />
          </RadioGroup>
          <TextField
            variant="outlined"
          />
          <Box mt={2} display="flex" alignContent="flex-end">
            <Button onClick={() => setAnchorEl(null)}>
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
export default SensitiveContentMenuButton;
