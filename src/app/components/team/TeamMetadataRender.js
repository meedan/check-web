import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import cx from 'classnames/bind';
import TeamTasksProject from './TeamTasksProject';
import SettingsHeader from './SettingsHeader';
import CreateTeamTask from './CreateTeamTask';
import BlankState from '../layout/BlankState';
import settingsStyles from './Settings.module.css';
import styles from './AnnotationSettings.module.css';

function TeamMetadataRender({ team, about }) {
  const [showTab, setShowTab] = React.useState('items');
  const handleTabChange = (e, value) => {
    setShowTab(value);
  };
  const associatedType = showTab === 'items' ? 'ProjectMedia' : 'Source';
  const teamMetadata = team.team_tasks.edges.map(task => task.node)
    .filter(t => t.associated_type === associatedType);

  return (
    <>
      <Tabs
        indicatorColor="primary"
        scrollButtons="auto"
        textColor="primary"
        orientation="horizontal"
        variant="scrollable"
        value={showTab}
        onChange={handleTabChange}
        className={styles['annotation-tabs']}
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
