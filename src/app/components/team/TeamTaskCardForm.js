/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  MetadataDate,
  MetadataFile,
  MetadataMultiselect,
  MetadataNumber,
  MetadataLocation,
  MetadataUrl,
} from '@meedan/check-ui';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import MetadataText from '../metadata/MetadataText';
import styles from './Tasks.module.css';

const TeamTaskCardForm = ({ about, task }) => (
  <div className={styles['task-card-form']}>
    { (task.type === 'single_choice' || task.type === 'multiple_choice') ?
      <MetadataMultiselect
        AnnotatorInformation={() => null}
        CancelButton={() => null}
        DeleteButton={() => null}
        EditButton={() => null}
        FieldInformation={() => null}
        SaveButton={() => null}
        classes={{}}
        disabled
        hasData=""
        isSingle={task.type === 'single_choice'}
        metadataValue=""
        node={task}
        setMetadataValue={() => null}
      /> : null
    }
    { task.type === 'free_text' ?
      <MetadataText
        AnnotatorInformation={() => null}
        CancelButton={() => null}
        DeleteButton={() => null}
        EditButton={() => null}
        FieldInformation={() => null}
        SaveButton={() => null}
        disabled
        hasData=""
        metadataValue=""
        node={task}
        setMetadataValue={() => null}
      /> : null
    }
    { task.type === 'number' ?
      <MetadataNumber
        AnnotatorInformation={() => null}
        CancelButton={() => null}
        DeleteButton={() => null}
        EditButton={() => null}
        FieldInformation={() => null}
        SaveButton={() => null}
        classes={{}}
        disabled
        hasData=""
        metadataValue=""
        node={task}
        setMetadataValue={() => null}
      /> : null
    }
    { task.type === 'geolocation' ?
      <MetadataLocation
        AnnotatorInformation={() => null}
        CancelButton={() => null}
        DeleteButton={() => null}
        EditButton={() => null}
        FieldInformation={() => null}
        SaveButton={() => null}
        classes={{}}
        disabled
        hasData=""
        mapboxApiKey={config.mapboxApiKey}
        messages={{
          customize: (
            <FormattedMessage
              defaultMessage="Customize place name"
              description="This is a label that appears on a text field, related to a pin on a map. The user may type any text of their choice here and name the place they are pinning. They can also modify suggested place names here."
              id="metadata.location.customize"
            />
          ),
          coordinates: (
            <FormattedMessage
              defaultMessage="Latitude, longitude"
              description="This is a label that appears on a text field, related to a pin on a map. This contains the latitude and longitude coordinates of the map pin. If the user changes these numbers, the map pin moves. If the user moves the map pin, the numbers update to reflect the new pin location."
              id="metadata.location.coordinates"
            />
          ),
          coordinatesHelper: (
            <FormattedMessage
              defaultMessage="Should be a comma-separated pair of latitude and longitude coordinates like '-12.9, -38.15'. Drag the map pin if you are having difficulty."
              description="This is a helper message that appears when someone enters text in the 'Latitude, longitude' text field that cannot be parsed as a valid pair of latitude and longitude coordinates. It tells the user that they need to provide valid coordinates and gives an example. It also tells them that they can do a drag action with the mouse on the visual map pin as an alternative to entering numbers in this field."
              id="metadata.location.coordinates.helper"
            />
          ),
          search: (
            <FormattedMessage
              defaultMessage="Search the map"
              description="This is a label that appears on a text field. If the user begins to type a location they will receive a list of suggested place names."
              id="metadata.location.search"
            />
          ),
        }}
        metadataValue=""
        node={task}
        setMetadataValue={() => null}
      /> : null
    }
    { task.type === 'datetime' ?
      <MetadataDate
        AnnotatorInformation={() => null}
        CancelButton={() => null}
        DeleteButton={() => null}
        EditButton={() => null}
        FieldInformation={() => null}
        SaveButton={() => null}
        classes={{}}
        disabled
        hasData=""
        metadataValue=""
        node={task}
        setMetadataValue={() => null}
      /> : null
    }
    { task.type === 'file_upload' ?
      <MetadataFile
        AnnotatorInformation={() => null}
        CancelButton={() => null}
        DeleteButton={() => null}
        EditButton={() => null}
        FieldInformation={() => null}
        SaveButton={() => null}
        classes={{}}
        disabled
        extensions={[]}
        fileSizeMax=""
        hasData=""
        messages={{
          dropFile: (
            <FormattedMessage
              defaultMessage="Drag and drop a file here, or click to upload a file (max size: {fileSizeLabel}, allowed extensions: {extensions})"
              description="This message appears in a rectangle, instructing the user that they can use their mouse to drag and drop a file, or click to pull up a file selector menu. This also tells them the maximum allowed file size, and the valid types of files that the user can upload. The `fileSizeLabel` variable will read something like '1.0 MB', and the 'extensions' variable is a list of valid file extensions. Neither will be localized."
              id="metadata.file.dropFile"
              values={{
                fileSizeLabel: about ? about.file_max_size : '',
                extensions: about ? about.file_extensions.join(', ') : '',
              }}
            />
          ),
        }}
        metadataValue=""
        node={task}
        setMetadataValue={() => null}
      /> : null
    }
    { task.type === 'url' ?
      <MetadataUrl
        AnnotatorInformation={() => null}
        CancelButton={() => null}
        DeleteButton={() => null}
        EditButton={() => null}
        FieldInformation={() => null}
        SaveButton={() => null}
        classes={{}}
        disabled
        hasData=""
        messages={{
          helperText: (
            <FormattedMessage
              defaultMessage="Must be a valid URL"
              description="A message that appears underneath a text box when a user enters text that a web browser would not interpret as a URL."
              id="metadata.url.helperText"
            />
          ),
        }}
        metadataValue=""
        node={task}
        setMetadataValue={() => null}
      /> : null
    }
  </div>
);

TeamTaskCardForm.propTypes = {
  task: PropTypes.shape({
    type: PropTypes.string.isRequired,
  }).isRequired,
  about: PropTypes.shape({
    file_max_size: PropTypes.string.isRequired,
    file_extensions: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
};

export default TeamTaskCardForm;
