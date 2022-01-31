import React from 'react';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { FormattedMessage } from 'react-intl';
import deepEqual from 'deep-equal';
import IconButton from '@material-ui/core/IconButton';
import HelpIcon from '@material-ui/icons/HelpOutline';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import LanguageSwitcher from '../../LanguageSwitcher';
import ReportDesignerTopBar from './ReportDesignerTopBar';
import ReportDesignerPreview from './ReportDesignerPreview';
import ReportDesignerForm from './ReportDesignerForm';
import ConfirmProceedDialog from '../../layout/ConfirmProceedDialog';
import { withSetFlashMessage } from '../../FlashMessage';
import { can } from '../../Can';
import {
  defaultOptions,
  findReportIndex,
  propsToData,
  cloneData,
} from './reportDesignerHelpers';
import { getStatus, getStatusStyle } from '../../../helpers';
import { stringHelper } from '../../../customHelpers';
import { checkBlue, backgroundMain } from '../../../styles/js/shared';
import CreateReportDesignMutation from '../../../relay/mutations/CreateReportDesignMutation';
import UpdateReportDesignMutation from '../../../relay/mutations/UpdateReportDesignMutation';
import CheckArchivedFlags from '../../../CheckArchivedFlags';
import { getListUrlQueryAndIndex } from '../../../urlHelpers';

let hasUnsavedChanges = false;

const useStyles = makeStyles(theme => ({
  section: {
    height: 'calc(100vh - 60px)',
    overflow: 'auto',
    padding: theme.spacing(2),
    backgroundColor: backgroundMain,
  },
  preview: {
    borderRight: '1px solid #DFE4F4',
  },
  editor: {
    padding: '16px 32px',
  },
  title: {
    display: 'flex',
    alignItems: 'center',
  },
  helpIcon: {
    color: checkBlue,
  },
}));

const ReportDesignerComponent = (props) => {
  const classes = useStyles();
  const { media, media: { team } } = props;

  const savedReportData = props.media.dynamic_annotation_report_design || { data: {} };
  const initialLanguage = savedReportData.data.default_language || team.get_language || 'en';
  const [currentLanguage, setCurrentLanguage] = React.useState(initialLanguage);
  const [data, setData] = React.useState(propsToData(props, currentLanguage));
  const [leaveLocation, setLeaveLocation] = React.useState(null);
  const [editing, setEditing] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  const defaultLanguage = data.default_language || team.get_language || 'en';
  const languages = team.get_languages ? JSON.parse(team.get_languages) : [defaultLanguage];
  const currentReportIndex = findReportIndex(data, currentLanguage);
  hasUnsavedChanges = !deepEqual(data, propsToData(props, defaultLanguage));

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

  const handleChangeLanguage = (newLanguageCode) => {
    const reportIndex = findReportIndex(data, newLanguageCode);
    if (reportIndex === -1) {
      const updatedData = cloneData(data);
      const newReport = defaultOptions(media, newLanguageCode);
      updatedData.options.push(newReport);
      setData(updatedData);
    }
    setCurrentLanguage(newLanguageCode);
  };

  const handleSetDefaultLanguage = (newValue) => {
    const updatedData = cloneData(data);
    updatedData.default_language = newValue;
    setData(updatedData);
  };

  const handleConfirmLeave = () => {
    const finalLocation = Object.assign(leaveLocation, { state: { confirmed: true } });
    browserHistory.push(finalLocation);
  };

  const handleCancelLeave = () => {
    setLeaveLocation(null);
  };

  const handleStatusChange = () => {
    const updatedData = cloneData(data);
    updatedData.options.forEach((option, i) => {
      const status = getStatus(
        media.team.verification_statuses,
        media.last_status,
        option.language,
        media.team.get_language,
      );
      updatedData.options[i].status_label = status.label.substring(0, 16);
      updatedData.options[i].theme_color = getStatusStyle(status, 'color');
    });
    setData(updatedData);
  };

  const handleEdit = () => {
    setEditing(true);
  };

  // We can pass a hash of "field => value" (in order to update multiple fields at once) or just a pair "field, value" (in order to update only one field)
  const handleUpdate = (fieldOrObject, valueOrNothing) => {
    let updates = {};
    if (typeof fieldOrObject === 'object') {
      updates = fieldOrObject;
    } else {
      updates[fieldOrObject] = valueOrNothing;
    }
    const updatedData = cloneData(data);
    Object.keys(updates).forEach((field) => {
      const value = updates[field];
      if (currentReportIndex > -1) {
        updatedData.options[currentReportIndex][field] = value;
      } else {
        const newReport = defaultOptions(media, currentLanguage);
        newReport[field] = value;
        updatedData.options.push(newReport);
      }
    });
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
      props.setFlashMessage(message, 'error');
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
    setPending(true);

    const fields = JSON.parse(JSON.stringify(data));
    delete fields.last_published;
    if (state) {
      fields.state = state;
    }

    if (state === 'published') {
      fields.last_published = parseInt(new Date().getTime() / 1000, 10).toString();
      if (!fields.first_published) {
        fields.first_published = parseInt(new Date().getTime() / 1000, 10).toString();
      }
      fields.options.forEach((option, i) => {
        fields.options[i].previous_published_status_label = option.status_label;
      });
    }

    const images = {};
    fields.options.forEach((option, i) => {
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

  const handleHelp = () => {
    window.open('http://help.checkmedia.org/en/articles/3627266-check-message-report');
  };

  const { routeParams, location } = props;
  let prefixUrl = `/${team.slug}`;
  if (routeParams.projectId || routeParams.listId) {
    const { listUrl } = getListUrlQueryAndIndex(routeParams, location.query);
    prefixUrl = listUrl;
  }

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
          media.archived > CheckArchivedFlags.NONE ||
          pending
        }
        onStatusChange={handleStatusChange}
        onStateChange={(action, state) => { handleSave(action, state); }}
        onSave={() => { handleSave('save'); }}
        onEdit={handleEdit}
        prefixUrl={prefixUrl}
      />
      <Box display="flex" width="1">
        <Box flex="1" alignItems="flex-start" display="flex" className={[classes.preview, classes.section].join(' ')}>
          <ReportDesignerPreview data={data.options[currentReportIndex]} media={media} />
        </Box>
        <Box flex="1" className={[classes.editor, classes.section].join(' ')}>
          <Box display="flex">
            <Typography className={classes.title} color="inherit" variant="h6" component="div">
              <FormattedMessage
                id="reportDesigner.title"
                defaultMessage="Design your report"
              />
            </Typography>
            <IconButton onClick={handleHelp}>
              <HelpIcon className={classes.helpIcon} />
            </IconButton>
          </Box>
          <LanguageSwitcher
            primaryLanguage={defaultLanguage}
            currentLanguage={currentLanguage}
            languages={languages}
            onChange={handleChangeLanguage}
            onSetDefault={editing ? handleSetDefaultLanguage : null}
          />
          <ReportDesignerForm
            data={data.options[currentReportIndex]}
            media={media}
            disabled={!editing}
            onUpdate={handleUpdate}
          />
        </Box>
      </Box>
      <ConfirmProceedDialog
        open={leaveLocation}
        title={
          <FormattedMessage
            id="reportDesigner.confirmLeaveTitle"
            defaultMessage="Do you want to leave without saving?"
          />
        }
        body={
          <div>
            <Typography variant="body1" component="p" paragraph>
              <FormattedMessage
                id="reportDesigner.confirmLeaveText"
                defaultMessage="You currently have unsaved changes. If you leave now you will lose all unsaved changes!"
              />
            </Typography>
          </div>
        }
        proceedLabel={
          <FormattedMessage
            id="reportDesigner.confirmLeaveButtonLabel"
            defaultMessage="Leave without saving"
          />
        }
        onProceed={handleConfirmLeave}
        cancelLabel={
          <FormattedMessage
            id="reportDesigner.cancelLeaveButtonLabel"
            defaultMessage="Go back"
          />
        }
        onCancel={handleCancelLeave}
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

// TODO: createFragmentContainer
export default withSetFlashMessage(ReportDesignerComponent);
