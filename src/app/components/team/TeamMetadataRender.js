import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import cx from 'classnames/bind';
import { ToggleButton, ToggleButtonGroup } from '../cds/inputs/ToggleButtonGroup';
import TeamTasksProject from './TeamTasksProject';
import SettingsHeader from './SettingsHeader';
import CreateTeamTask from './CreateTeamTask';
import BlankState from '../layout/BlankState';
import settingsStyles from './Settings.module.css';

function TeamMetadataRender({ team, about }) {
  const [showTab, setShowTab] = React.useState('items');
  const associatedType = showTab === 'items' ? 'ProjectMedia' : 'Source';
  const teamMetadata = team.team_tasks.edges.map(task => task.node)
    .filter(t => t.associated_type === associatedType);

  return (
    <>
      <SettingsHeader
        title={
          <FormattedMessage
            id="teamMetadataRender.headerTitle"
            defaultMessage="Annotation Form"
            description="Title for annotation settings screen."
          />
        }
        context={
          associatedType === 'ProjectMedia' ?
            <FormattedHTMLMessage
              id="teamMetadataRender.itemHelpContext"
              defaultMessage='Customize the item annotation form. Learn more about <a href="{helpLink}" target="_blank" title="Learn more">using annotations</a> to add context to items.'
              description="Context description for the functionality of the item portion of this page"
              values={{ helpLink: 'https://help.checkmedia.org/en/articles/4346772-annotation' }}
            /> :
            <FormattedHTMLMessage
              id="teamMetadataRender.sourceHelpContext"
              defaultMessage='Customize the source annotation form. Learn more about <a href="{helpLink}" target="_blank" title="Learn more">describing sources</a>.'
              description="Context description for the functionality of source portion of this page"
              values={{ helpLink: 'http://help.checkmedia.org/en/articles/4346772-annotation' }}
            />
        }
        extra={
          <ToggleButtonGroup
            variant="contained"
            value={showTab}
            onChange={(e, newValue) => { setShowTab(newValue); }}
            exclusive
          >
            <ToggleButton value="items" key="items" className="int-annotations__button--page-content-items">
              <FormattedMessage
                id="teamMetadataRender.headerItemButton"
                defaultMessage="Items"
                description="Button to select to see the content for this page. Refers to annotation applied to items generally, not any specific item or items."
              />
            </ToggleButton>
            <ToggleButton value="sources" key="sources" className="int-annotations__button--page-content-sources">
              <FormattedMessage
                id="teamMetadataRender.headerSourceButton"
                defaultMessage="Sources"
                description="Button to select to see the content for this page. Refers to annotation applied to sources generally, not any specific source or sources."
              />
            </ToggleButton>
          </ToggleButtonGroup>
        }
        actionButton={
          <CreateTeamTask fieldset="metadata" associatedType={associatedType} team={team} />
        }
      />
      <div className={cx(settingsStyles['setting-details-wrapper'])}>
        { teamMetadata.length ?
          <TeamTasksProject
            fieldset="metadata"
            project={{ teamTasks: teamMetadata }}
            team={team}
            about={about}
          /> :
          <BlankState>
            <FormattedMessage
              id="teamMetadataRender.blankAnnotations"
              defaultMessage="No annotation fields"
              description="Text for empty annotations"
            />
          </BlankState>
        }
      </div>
    </>
  );
}

TeamMetadataRender.propTypes = {
  team: PropTypes.object.isRequired, // GraphQL "Team" object
  about: PropTypes.object.isRequired,
};

export default TeamMetadataRender;
