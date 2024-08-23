/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import cx from 'classnames/bind';
import TeamTasksProject from './TeamTasksProject';
import SettingsHeader from './SettingsHeader';
import CreateTeamTask from './CreateTeamTask';
import BlankState from '../layout/BlankState';
import { ToggleButton, ToggleButtonGroup } from '../cds/inputs/ToggleButtonGroup';
import settingsStyles from './Settings.module.css';

function TeamMetadataRender({ about, team }) {
  const [showTab, setShowTab] = React.useState('items');
  const associatedType = showTab === 'items' ? 'ProjectMedia' : 'Source';
  const teamMetadata = team.team_tasks.edges.map(task => task.node)
    .filter(t => t.associated_type === associatedType);

  return (
    <>
      <SettingsHeader
        actionButton={
          <CreateTeamTask associatedType={associatedType} fieldset="metadata" team={team} />
        }
        context={
          associatedType === 'ProjectMedia' ?
            <FormattedHTMLMessage
              defaultMessage='Customize the item annotation form. Learn more about <a href="{helpLink}" target="_blank" title="Learn more">using annotations</a> to add context to items.'
              description="Context description for the functionality of the item portion of this page"
              id="teamMetadataRender.itemHelpContext"
              values={{ helpLink: 'https://help.checkmedia.org/en/articles/4346772-annotation' }}
            /> :
            <FormattedHTMLMessage
              defaultMessage='Customize the source annotation form. Learn more about <a href="{helpLink}" target="_blank" title="Learn more">describing sources</a>.'
              description="Context description for the functionality of source portion of this page"
              id="teamMetadataRender.sourceHelpContext"
              values={{ helpLink: 'https://help.checkmedia.org/en/articles/4346772-annotation' }}
            />
        }
        extra={
          <ToggleButtonGroup
            exclusive
            value={showTab}
            variant="contained"
            onChange={(e, newValue) => { setShowTab(newValue); }}
          >
            <ToggleButton className="int-annotations__button--page-content-items" key="items" value="items">
              <FormattedMessage
                defaultMessage="Items"
                description="Button to select to see the content for this page. Refers to annotation applied to items generally, not any specific item or items."
                id="teamMetadataRender.headerItemButton"
              />
            </ToggleButton>
            <ToggleButton className="int-annotations__button--page-content-sources" key="sources" value="sources">
              <FormattedMessage
                defaultMessage="Sources"
                description="Button to select to see the content for this page. Refers to annotation applied to sources generally, not any specific source or sources."
                id="teamMetadataRender.headerSourceButton"
              />
            </ToggleButton>
          </ToggleButtonGroup>
        }
        title={
          <FormattedMessage
            defaultMessage="Annotation Form"
            description="Title for annotation settings screen."
            id="teamMetadataRender.headerTitle"
          />
        }
      />
      <div className={cx(settingsStyles['setting-details-wrapper'])}>
        { teamMetadata.length ?
          <TeamTasksProject
            about={about}
            fieldset="metadata"
            project={{ teamTasks: teamMetadata }}
            team={team}
          /> :
          <BlankState>
            <FormattedMessage
              defaultMessage="No Workspace Annotations"
              description="Text for empty annotations"
              id="teamMetadataRender.blankAnnotations"
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
