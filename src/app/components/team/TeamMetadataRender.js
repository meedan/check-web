import React from 'react';
import { FormattedMessage } from 'react-intl';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import { makeStyles } from '@material-ui/core/styles';
import TeamTasksProject from './TeamTasksProject';
import SettingsHeader from './SettingsHeader';
import CreateTeamTask from './CreateTeamTask';
import BlankState from '../layout/BlankState';
import { backgroundMain } from '../../styles/js/shared';

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
    backgroundColor: `${backgroundMain}`,
    display: 'flex',
    height: 224,
  },
  tabs: {
    backgroundColor: `${backgroundMain}`,
  },
  tabContent: {
    width: '100%',
  },
});

function TeamMetadataRender({ team }) {
  const [showTab, setShowTab] = React.useState('items');
  const classes = useStyles();
  const handleTabChange = (e, value) => {
    setShowTab(value);
  };
  const teamItemTasks = team.team_tasks.edges.map(task => task.node);

  const teamSourceTasks = [];

  const renderTeamTaskList = (teamTasks) => {
    if (teamTasks.length) {
      return (
        <TeamTasksProject
          fieldset="metadata"
          project={{ teamTasks }}
          team={team}
        />);
    }

    return (
      <BlankState>
        <FormattedMessage
          id="teamMetadataRender.blankMetadata"
          defaultMessage="No metadata fields"
          description="Text for empty metadata"
        />
      </BlankState>
    );
  };

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
      <div className={classes.root}>
        <Tabs
          indicatorColor="primary"
          scrollButtons="auto"
          textColor="primary"
          orientation="vertical"
          variant="scrollable"
          value={showTab}
          onChange={handleTabChange}
          className={classes.tabs}
        >
          <Tab
            fullWidth
            label="Items"
            value="items"
            className="metadata-tab__items"
          />
          <Tab
            label="Sources"
            value="sources"
            className="metadata-tab__source"
          />
        </Tabs>
        <div className={classes.tabContent} >
          { showTab === 'items' ? renderTeamTaskList(teamItemTasks) : null }
          { showTab === 'sources' ? renderTeamTaskList(teamSourceTasks) : null }
        </div>
      </div>
    </div>
  );
}

export default TeamMetadataRender;
