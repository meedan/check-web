import React from 'react';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import ReportDesignerTopBar from './ReportDesignerTopBar';
import ReportDesignerPreview from './ReportDesignerPreview';
import ReportDesignerForm from './ReportDesignerForm';
import {
  defaultOptions,
  propsToData,
} from './reportDesignerHelpers';
import Alert from '../../cds/alerts-and-prompts/Alert';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import { withSetFlashMessage } from '../../FlashMessage';
import { can } from '../../Can';
import { getStatus, getStatusStyle, safelyParseJSON } from '../../../helpers';
import { stringHelper } from '../../../customHelpers';
import CreateReportDesignMutation from '../../../relay/mutations/CreateReportDesignMutation';
import UpdateReportDesignMutation from '../../../relay/mutations/UpdateReportDesignMutation';
import CheckArchivedFlags from '../../../CheckArchivedFlags';
import { getListUrlQueryAndIndex } from '../../../urlHelpers';
import HelpIcon from '../../../icons/help.svg';
import styles from './ReportDesigner.module.css';

const ReportDesignerComponent = (props) => {
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
        defaultMessage="Sorry, an error occurred while updating the report settings. Please try again and contact {supportEmail} if the condition persists."
        description="Message when an error is returned and how to reach support via email address"
        id="reportDesigner.error"
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
    window.open('https://help.checkmedia.org/en/articles/8772805-fact-check-reports-guide#h_274b08eeab');
  };

  const { location, routeParams } = props;
  let prefixUrl = `/${team.slug}`;
  if (routeParams.projectId || routeParams.listId) {
    const { listUrl } = getListUrlQueryAndIndex(routeParams, location.query);
    prefixUrl = listUrl;
  }

  return (
    <React.Fragment>
      <div className={styles['report-designer-wrapper']}>
        {data.state === 'published' ?
          <>
            <Alert
              banner
              content={
                <FormattedMessage
                  defaultMessage="To make edits, pause this report. This will stop the report from being sent out to users until it is published again."
                  description="Content of a page level alert telling the user the report is currently in the published state and they need to change the state to pause in order to edit"
                  id="reportDesigner.alertContent"
                />
              }
              icon
              title={
                <FormattedMessage
                  defaultMessage="Report is published"
                  description="Title of a page level alert telling the user the report is currently in the published state"
                  id="reportDesigner.alertTitle"
                />
              }
              variant="success"
            />
          </> : null
        }
        <ReportDesignerTopBar
          data={data}
          defaultLanguage={currentLanguage}
          media={media}
          prefixUrl={prefixUrl}
          readOnly={
            !can(media.permissions, 'update ProjectMedia') ||
            (media.archived > CheckArchivedFlags.NONE && media.archived !== CheckArchivedFlags.UNCONFIRMED) ||
            pending
          }
          state={data.state}
          onStateChange={(action, state) => { handleSave(action, state); }}
          onStatusChange={handleStatusChange}
        />
        <div className={styles['report-designer']}>
          <div className={styles['report-editor']}>
            <h6 className="report-designer__title">
              <FormattedMessage
                defaultMessage="Design your report"
                description="Section title for inputs to design the report"
                id="reportDesigner.title"
              />
              <ButtonMain
                iconCenter={<HelpIcon />}
                size="default"
                theme="text"
                variant="text"
                onClick={handleHelp}
              />
            </h6>
            <ReportDesignerForm
              data={data.options}
              disabled={data.state === 'published'}
              media={media}
              pending={pending}
              team={team}
              onUpdate={handleUpdate}
            />
          </div>
          <div className={styles['report-preview']}>
            <FormattedMessage
              defaultMessage="Preview your report"
              description="Section title for the visual preview of the report being created"
              id="reportDesigner.previewTitle"
              tagName="h6"
            />
            <ReportDesignerPreview data={data.options} media={media} />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

ReportDesignerComponent.propTypes = {
  media: PropTypes.object.isRequired,
  setFlashMessage: PropTypes.func.isRequired,
};

// TODO: createFragmentContainer
export default withSetFlashMessage(ReportDesignerComponent);
