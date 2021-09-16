import React from 'react';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import {
  MetadataDate,
  MetadataFile,
  MetadataMultiselect,
  MetadataNumber,
  MetadataText,
  MetadataLocation,
} from '@meedan/check-ui';
import config from 'config'; // eslint-disable-line require-path-exists/exists

const TeamTaskCardForm = ({ task }) => (
  <Box mx={2} mb={2}>
    { (task.type === 'single_choice' || task.type === 'multiple_choice') ?
      <MetadataMultiselect
        isSingle={task.type === 'single_choice'}
        disabled
        node={task}
        classes={{}}
        DeleteButton={() => null}
        CancelButton={() => null}
        SaveButton={() => null}
        EditButton={() => null}
        AnnotatorInformation={() => null}
        FieldInformation={() => null}
        hasData=""
        metadataValue=""
        setMetadataValue={() => null}
      /> : null
    }
    { task.type === 'free_text' ?
      <MetadataText
        disabled
        node={task}
        classes={{}}
        DeleteButton={() => null}
        CancelButton={() => null}
        SaveButton={() => null}
        EditButton={() => null}
        AnnotatorInformation={() => null}
        FieldInformation={() => null}
        hasData=""
        metadataValue=""
        setMetadataValue={() => null}
      /> : null
    }
    { task.type === 'number' ?
      <MetadataNumber
        disabled
        node={task}
        classes={{}}
        DeleteButton={() => null}
        CancelButton={() => null}
        SaveButton={() => null}
        EditButton={() => null}
        AnnotatorInformation={() => null}
        FieldInformation={() => null}
        hasData=""
        metadataValue=""
        setMetadataValue={() => null}
      /> : null
    }
    { task.type === 'geolocation' ?
      <MetadataLocation
        disabled
        node={task}
        classes={{}}
        DeleteButton={() => null}
        CancelButton={() => null}
        SaveButton={() => null}
        EditButton={() => null}
        AnnotatorInformation={() => null}
        FieldInformation={() => null}
        hasData=""
        metadataValue=""
        setMetadataValue={() => null}
        mapboxApiKey={config.mapboxApiKey}
        messages={{}}
      /> : null
    }
    { task.type === 'datetime' ?
      <MetadataDate
        disabled
        node={task}
        classes={{}}
        DeleteButton={() => null}
        CancelButton={() => null}
        SaveButton={() => null}
        EditButton={() => null}
        AnnotatorInformation={() => null}
        FieldInformation={() => null}
        hasData=""
        metadataValue=""
        setMetadataValue={() => null}
      /> : null
    }
    { task.type === 'file_upload' ?
      <MetadataFile
        disabled
        node={task}
        classes={{}}
        DeleteButton={() => null}
        CancelButton={() => null}
        SaveButton={() => null}
        EditButton={() => null}
        AnnotatorInformation={() => null}
        FieldInformation={() => null}
        hasData=""
        metadataValue=""
        setMetadataValue={() => null}
        extensions={[]}
        fileSizeMax=""
        messages={{}}
      /> : null
    }
  </Box>
);

TeamTaskCardForm.propTypes = {
  task: PropTypes.shape({
    type: PropTypes.string.isRequired,
  }).isRequired,
};

export default TeamTaskCardForm;
