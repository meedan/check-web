import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import { makeStyles } from '@material-ui/core/styles';
import TeamTasksProject from './TeamTasksProject';
import SettingsHeader from './SettingsHeader';
import CreateTeamTask from './CreateTeamTask';
import BlankState from '../layout/BlankState';
import { backgroundMain, ContentColumn } from '../../styles/js/shared';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    backgroundColor: `${backgroundMain}`,
    display: 'flex',
    height: 224,
  },
  tabs: {
    backgroundColor: `${backgroundMain}`,
    marginRight: theme.spacing(5),
    marginTop: theme.spacing(2),
  },
  tabContent: {
    width: '100%',
  },
}));

function TeamMetadataRender({ team }) {
  const [showTab, setShowTab] = React.useState('items');
  const classes = useStyles();
  const handleTabChange = (e, value) => {
    setShowTab(value);
  };
  const associatedType = showTab === 'items' ? 'ProjectMedia' : 'Source';
  const teamMetadata = team.team_tasks.edges.map(task => task.node)
    .filter(t => t.associated_type === associatedType);

  return (
    <Box display="flex" justifyContent="center" className="team-metadata">
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
      <ContentColumn large>
        <SettingsHeader
          title={
            associatedType === 'ProjectMedia' ?
              <FormattedMessage
                id="teamMetadataRender.itemTitle"
                defaultMessage="Metadata"
                description="Title for item Metadata"
              /> :
              <FormattedMessage
                id="teamMetadataRender.sourceTitle"
                defaultMessage="Source metadata"
                description="Ttle for source Metadata"
              />
          }
          subtitle={
            associatedType === 'ProjectMedia' ?
              <FormattedMessage
                id="teamMetadataRender.metadataItemSubtitle"
                defaultMessage="Add custom metadata fields to items."
                description="Metadata item subtitle"
              /> :
              <FormattedMessage
                id="teamMetadataRender.metadataSourceSubtitle"
                defaultMessage="Add custom data ields to the source tab."
                description="Metadata source subtitle"
              />
          }
          helpUrl="https://help.checkmedia.org/en/articles/4346772-metadata"
          actionButton={
            <CreateTeamTask fieldset="metadata" associatedType={associatedType} team={team} />
          }
        />
        <div className={classes.root}>
          <div className={classes.tabContent} >
            { teamMetadata.length ?
              <TeamTasksProject
                fieldset="metadata"
                project={{ teamTasks: teamMetadata }}
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
        </div>
      </ContentColumn>
    </Box>
  );
}

TeamMetadataRender.propTypes = {
  team: PropTypes.object.isRequired, // GraphQL "Team" object
};

export default TeamMetadataRender;
