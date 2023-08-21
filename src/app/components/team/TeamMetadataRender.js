import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import { makeStyles } from '@material-ui/core/styles';
import cx from 'classnames/bind';
import TeamTasksProject from './TeamTasksProject';
import SettingsHeader from './SettingsHeader';
import CreateTeamTask from './CreateTeamTask';
import BlankState from '../layout/BlankState';
import settingsStyles from './Settings.module.css';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    backgroundColor: 'var(--grayBackground)',
    display: 'flex',
    minHeight: 224,
    marginBottom: 50,
  },
  tabs: {
    backgroundColor: 'var(--grayBackground)',
    marginRight: theme.spacing(5),
    marginTop: theme.spacing(2),
  },
  tabContent: {
    width: '100%',
  },
}));

function TeamMetadataRender({ team, about }) {
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
      <SettingsHeader
        title={
          associatedType === 'ProjectMedia' ?
            <FormattedMessage
              id="teamMetadataRender.itemTitle"
              defaultMessage="Item annotation form"
              description="Title for annotation settings screen. Refers to annotation applied to items generally, not any specific item or items."
            /> :
            <FormattedMessage
              id="teamMetadataRender.sourceTitle"
              defaultMessage="Source annotation form"
              description="Title for annotation settings screen. Refers to annotation applied to sources generally, not any specific source or sources."
            />
        }
        helpUrl={
          associatedType === 'ProjectMedia' ?
            'https://help.checkmedia.org/en/articles/4346772-metadata' :
            'https://help.checkmedia.org/en/articles/4837896-sources#h_bb2bd143fd'
        }
        actionButton={
          <CreateTeamTask fieldset="metadata" associatedType={associatedType} team={team} />
        }
      />
      <div className={cx(settingsStyles['setting-details-wrapper'])}>
        <div className={classes.root}>
          <div className={classes.tabContent} >
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
        </div>
      </div>
    </Box>
  );
}

TeamMetadataRender.propTypes = {
  team: PropTypes.object.isRequired, // GraphQL "Team" object
  about: PropTypes.object.isRequired,
};

export default TeamMetadataRender;
