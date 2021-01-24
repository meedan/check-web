import React from 'react';
import { FormattedMessage } from 'react-intl';
import TeamTasksProject from './TeamTasksProject';
import SettingsHeader from './SettingsHeader';
import CreateTeamTask from './CreateTeamTask';
import BlankState from '../layout/BlankState';

function TeamMetadataRender({ team }) {
  const teamTasks = team.team_tasks.edges.map(task => task.node);

  return (
    <div className="team-metadata">
      <SettingsHeader
        title={
          <FormattedMessage
            id="teamMetadataRender.title"
            defaultMessage="Metadata"
            description="Metadata title"
          />
        }
        subtitle={
          <FormattedMessage
            id="teamMetadataRender.metadataSubtitle"
            defaultMessage="Add custom metadata fields to items."
            description="Metadata subtitle"
          />
        }
        helpUrl="https://help.checkmedia.org/en/articles/4346772-metadata"
        actionButton={
          <CreateTeamTask fieldset="metadata" team={team} />
        }
      />
      { teamTasks.length ?
        <TeamTasksProject
          fieldset="metadata"
          project={{ teamTasks }}
          team={team}
        /> :
        <BlankState>
          <FormattedMessage
            id="teamMetadataRender.blankMetadata"
            defaultMessage="No metadata fields"
            description="Text for empty metadata"
          />
        </BlankState>
      }
    </div>
  );
}

export default TeamMetadataRender;
