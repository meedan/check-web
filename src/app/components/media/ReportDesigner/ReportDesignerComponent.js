/* eslint-disable @calm/react-intl/missing-attribute */
import React from 'react';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import IconButton from '@material-ui/core/IconButton';
import HelpIcon from '@material-ui/icons/HelpOutline';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import ReportDesignerTopBar from './ReportDesignerTopBar';
import ReportDesignerPreview from './ReportDesignerPreview';
import ReportDesignerForm from './ReportDesignerForm';
import { withSetFlashMessage } from '../../FlashMessage';
import { can } from '../../Can';
import {
  defaultOptions,
  propsToData,
} from './reportDesignerHelpers';
import { getStatus, getStatusStyle, safelyParseJSON } from '../../../helpers';
import { stringHelper } from '../../../customHelpers';
import { checkBlue, backgroundMain } from '../../../styles/js/shared';
import CreateReportDesignMutation from '../../../relay/mutations/CreateReportDesignMutation';
import UpdateReportDesignMutation from '../../../relay/mutations/UpdateReportDesignMutation';
import CheckArchivedFlags from '../../../CheckArchivedFlags';
import { getListUrlQueryAndIndex } from '../../../urlHelpers';

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

  const savedReportData = props.media?.dynamic_annotation_report_design || { data: { options: { } } };
  const languages = safelyParseJSON(team.get_languages) || ['en'];
  const defaultReportLanguage = languages && languages.length === 1 ? languages[0] : null;
  const currentLanguage = savedReportData.data.options.language || defaultReportLanguage;
  const [data, setData] = React.useState(propsToData(props, currentLanguage));
  const [pending, setPending] = React.useState(false);

  const handleStatusChange = () => {
    const updatedData = { ...data };
    const status = getStatus(
      media.team.verification_statuses,
      media.last_status,
      updatedData.options.language,
      media.team.get_language,
    );
    updatedData.options.status_label = status.label.substring(0, 16);
    updatedData.options.theme_color = getStatusStyle(status, 'color');
    setData(updatedData);
  };

  const handleSave = (action, state, updatedData) => {
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
      setPending(false);
    };

    const annotation = media.dynamic_annotation_report_design;
    setPending(true);

    const fields = JSON.parse(JSON.stringify(updatedData || data));
    delete fields.last_published;
    if (state) {
      fields.state = state;
    }

    if (state === 'published') {
      fields.last_published = parseInt(new Date().getTime() / 1000, 10).toString();
      if (!fields.first_published) {
        fields.first_published = parseInt(new Date().getTime() / 1000, 10).toString();
      }
      fields.options.previous_published_status_label = fields.options.status_label;
    }

    // Set language `und` for workspaces that has more than one language
    if (!fields.options.language) {
      fields.options.language = 'und';
    }

    let images = [];

    const { image } = data?.options || { image: null }; // File, String or null
    if (!image || image?.preview) {
      // image is a File? The mutation's fields.image must be "" and its
      // props.image must be the File.
      //
      // image is null? The mutation's fields.image must be "" and its
      // props.image must be null.
      fields.options.image = '';
    }
    if (image && image?.preview) {
      images = [image];
    }

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

  // We can pass a hash of "field => value" (in order to update multiple fields at once) or just a pair "field, value" (in order to update only one field)
  const handleUpdate = (fieldOrObject, valueOrNothing) => {
    let updates = {};
    if (typeof fieldOrObject === 'object') {
      updates = fieldOrObject;
    } else {
      updates[fieldOrObject] = valueOrNothing;
    }
    const updatedData = { ...data };
    Object.keys(updates).forEach((field) => {
      const value = updates[field];
      if (updatedData) {
        updatedData.options[field] = value;
      } else {
        const newReport = defaultOptions(media, currentLanguage);
        newReport[field] = value;
        updatedData.options = newReport;
      }
    });
    setData(updatedData);
    // It doesn't work to upload the image right away
    if (fieldOrObject !== 'image') {
      handleSave('save', null, updatedData);
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
        defaultLanguage={currentLanguage}
        data={data}
        state={data.state}
        readOnly={
          !can(media.permissions, 'update ProjectMedia') ||
          (media.archived > CheckArchivedFlags.NONE && media.archived !== CheckArchivedFlags.UNCONFIRMED) ||
          pending
        }
        onStatusChange={handleStatusChange}
        onStateChange={(action, state) => { handleSave(action, state); }}
        prefixUrl={prefixUrl}
      />
      <Box display="flex" width="1">
        <Box flex="1" alignItems="flex-start" display="flex" className={[classes.preview, classes.section].join(' ')}>
          <ReportDesignerPreview data={data.options} media={media} />
        </Box>
        <Box flex="1" className={[classes.editor, classes.section].join(' ')}>
          <Box display="flex" className="report-designer__title">
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
          <ReportDesignerForm
            data={data.options}
            disabled={data.state === 'published'}
            pending={pending}
            media={media}
            team={team}
            onUpdate={handleUpdate}
          />
        </Box>
      </Box>
    </React.Fragment>
  );
};

ReportDesignerComponent.propTypes = {
  media: PropTypes.object.isRequired,
  setFlashMessage: PropTypes.func.isRequired,
};

// TODO: createFragmentContainer
export default withSetFlashMessage(ReportDesignerComponent);
