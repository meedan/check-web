import React from 'react';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { FormattedMessage } from 'react-intl';
import deepEqual from 'deep-equal';
import Box from '@material-ui/core/Box';
import LanguageSwitcher from '../../LanguageSwitcher';
import ReportDesignerTopBar from './ReportDesignerTopBar';
import ReportDesignerPreview from './ReportDesignerPreview';
import ReportDesignerForm from './ReportDesignerForm';
import ConfirmDialog from '../../layout/ConfirmDialog';
import { withSetFlashMessage } from '../../FlashMessage';
import { can } from '../../Can';
import {
  defaultOptions,
  findReportIndex,
  propsToData,
  cloneData,
} from './reportDesignerHelpers';
import { getStatus, getStatusStyle } from '../../../helpers';
import { stringHelper, mediaStatuses, mediaLastStatus } from '../../../customHelpers';
import CreateReportDesignMutation from '../../../relay/mutations/CreateReportDesignMutation';
import UpdateReportDesignMutation from '../../../relay/mutations/UpdateReportDesignMutation';

let hasUnsavedChanges = false;

const ReportDesignerComponent = (props) => {
  const { media, media: { team } } = props;

  const defaultLanguage = team.get_language || 'en';

  const [currentLanguage, setCurrentLanguage] = React.useState(defaultLanguage);
  const [data, setData] = React.useState(propsToData(props, currentLanguage));
  const [leaveLocation, setLeaveLocation] = React.useState(null);
  const [editing, setEditing] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  const languages = team.get_languages ? JSON.parse(team.get_languages) : [defaultLanguage];
  const currentReportIndex = findReportIndex(data, currentLanguage);
  hasUnsavedChanges = !deepEqual(data, propsToData(props, currentLanguage));
  const defaultReportIsSet = data.options.filter(r => (
    (r.language === defaultLanguage) &&
    (r.use_visual_card || (r.use_text_message && r.text.length > 0))
  )).length === 1;
  const canPublish = defaultReportIsSet && data.options.filter(r => (
    (r.use_introduction && !r.use_visual_card && !r.use_text_message) ||
    (r.use_text_message && r.text.length === 0)
  )).length === 0;

  const confirmCloseBrowserWindow = (e) => {
    if (hasUnsavedChanges) {
      const message = 'Are you sure?'; // It's not displayed
      e.returnValue = message;
      return message;
    }
    e.preventDefault();
    return '';
  };

  React.useEffect(() => {
    props.router.setRouteLeaveHook(
      props.route,
      (nextLocation) => {
        if (!hasUnsavedChanges || (nextLocation.state && nextLocation.state.confirmed)) {
          return true;
        }
        setLeaveLocation(nextLocation);
        return false;
      },
    );
    window.addEventListener('beforeunload', confirmCloseBrowserWindow);

    return () => {
      window.removeEventListener('beforeunload', confirmCloseBrowserWindow);
    };
  }, []);

  const handleChangeLanguage = (newValue) => {
    if (findReportIndex(data, newValue) === -1) {
      const updatedData = cloneData(data);
      updatedData.options.push(defaultOptions(media, newValue));
      setData(updatedData);
    }
    setCurrentLanguage(newValue);
  };

  const handleConfirmLeave = () => {
    const finalLocation = Object.assign(leaveLocation, { state: { confirmed: true } });
    browserHistory.push(finalLocation);
  };

  const handleCancelLeave = () => {
    setLeaveLocation(null);
  };

  const handleStatusChange = () => {
    const status = getStatus(mediaStatuses(media), mediaLastStatus(media));
    if (status) {
      const updatedData = cloneData(data);
      updatedData.options.forEach((option, i) => {
        updatedData.options[i].previous_published_status_label = option.status_label;
        updatedData.options[i].status_label = status.label.substring(0, 16);
        updatedData.options[i].theme_color = getStatusStyle(status, 'color');
      });
      setData(updatedData);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleUpdate = (field, value) => {
    const updatedData = cloneData(data);
    updatedData.options[currentReportIndex][field] = value;
    setData(updatedData);
  };

  const handleSave = (action, state) => {
    const onFailure = () => {
      const message = (<FormattedMessage
        id="reportDesigner.error"
        defaultMessage="Sorry, an error occurred while updating the report settings. Please try again and contact {supportEmail} if the condition persists."
        values={{
          supportEmail: stringHelper('SUPPORT_EMAIL'),
        }}
      />);
      props.setFlashMessage(message);
      setPending(false);
    };

    const onSuccess = (responseData) => {
      const projectMedia = responseData.project_media;
      const nextProps = {
        ...props,
        media: {
          ...media,
          ...projectMedia,
        },
      };
      setData(propsToData(nextProps, currentLanguage));
      setEditing(false);
      setPending(false);
    };

    const annotation = media.dynamic_annotation_report_design;
    props.setFlashMessage(null);
    setPending(true);

    const fields = JSON.parse(JSON.stringify(data));
    delete fields.last_published;
    if (state) {
      fields.state = state;
    }

    if (state === 'published') {
      fields.last_published = parseInt(new Date().getTime() / 1000, 10).toString();
      fields.options.forEach((option, i) => {
        fields.options[i].previous_published_status_label = option.status_label;
      });
    }

    const images = {};
    fields.options.forEach((option, i) => {
      delete fields.options[i].previous_published_status_label;
      const { image } = data.options[i]; // File, String or null
      if (!image || image.preview) {
        // image is a File? The mutation's fields.image must be "" and its
        // props.image must be the File.
        //
        // image is null? The mutation's fields.image must be "" and its
        // props.image must be null.
        fields.options[i].image = '';
      }
      if (image && image.preview) {
        images[i] = image;
      }
    });
    fields.options = fields.options.filter(r => (
      r.use_introduction || r.use_visual_card || r.use_text_message
    ));

    if (!annotation) {
      Relay.Store.commitUpdate(
        new CreateReportDesignMutation({
          parent_type: 'project_media',
          images,
          annotated: media,
          annotation: {
            action,
            fields,
            annotated_type: 'ProjectMedia',
            annotated_id: media.dbid,
          },
        }),
        {
          onFailure,
          onSuccess: response => onSuccess(response.createDynamicAnnotationReportDesign),
        },
      );
    } else {
      Relay.Store.commitUpdate(
        new UpdateReportDesignMutation({
          id: annotation.id,
          images,
          parent_type: 'project_media',
          annotated: media,
          annotation: {
            action,
            fields,
            annotated_type: 'ProjectMedia',
            annotated_id: media.dbid,
          },
        }),
        {
          onFailure,
          onSuccess: response => onSuccess(response.updateDynamicAnnotationReportDesign),
        },
      );
    }
  };

  return (
    <React.Fragment>
      <ReportDesignerTopBar
        media={media}
        defaultLanguage={defaultLanguage}
        data={data}
        state={data.state}
        editing={editing}
        readOnly={
          !can(media.permissions, 'update ProjectMedia') ||
          media.archived ||
          pending
        }
        canPublish={canPublish}
        onStatusChange={handleStatusChange}
        onStateChange={(action, state) => { handleSave(action, state); }}
        onSave={() => { handleSave('save'); }}
        onEdit={handleEdit}
      />
      <Box display="flex" width="1">
        <Box flex="1" alignItems="flex-start" display="flex">
          <ReportDesignerPreview data={data.options[currentReportIndex]} media={media} />
        </Box>
        <Box flex="1">
          <LanguageSwitcher
            primaryLanguage={defaultLanguage}
            currentLanguage={currentLanguage}
            languages={languages}
            onChange={handleChangeLanguage}
          />
          <ReportDesignerForm
            data={data.options[currentReportIndex]}
            media={media}
            disabled={!editing}
            onUpdate={handleUpdate}
          />
        </Box>
      </Box>
      <ConfirmDialog
        open={leaveLocation}
        title={
          <FormattedMessage
            id="reportDesigner.confirmLeaveTitle"
            defaultMessage="Close without saving?"
          />
        }
        blurb={
          <FormattedMessage
            id="reportDesigner.confirmLeaveText"
            defaultMessage="If you continue, you will lose your changes."
          />
        }
        handleClose={handleCancelLeave}
        handleConfirm={handleConfirmLeave}
      />
    </React.Fragment>
  );
};

ReportDesignerComponent.propTypes = {
  media: PropTypes.object.isRequired,
  router: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired,
  setFlashMessage: PropTypes.func.isRequired,
};

export default withSetFlashMessage(ReportDesignerComponent);
