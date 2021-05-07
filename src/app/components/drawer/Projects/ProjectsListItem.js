import React from 'react';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { makeStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';

const useStyles = makeStyles(() => ({
  projectsListItemLabel: {
    fontSize: 14,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));

const ProjectsListItem = ({
  teamSlug,
  project,
  icon,
  routePrefix,
}) => {
  const classes = useStyles();

  const handleClick = () => {
    browserHistory.push(`/${teamSlug}/${routePrefix}/${project.dbid}`);
  };

  return (
    <ListItem button onClick={handleClick} title={project.title}>
      <ListItemIcon>
        {icon}
      </ListItemIcon>
      <ListItemText classes={{ primary: classes.projectsListItemLabel }}>
        {project.title}
      </ListItemText>
      <ListItemSecondaryAction>
        {project.medias_count}
      </ListItemSecondaryAction>
    </ListItem>
  );
};

ProjectsListItem.propTypes = {
  teamSlug: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  routePrefix: PropTypes.string.isRequired,
  project: PropTypes.shape({
    dbid: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    medias_count: PropTypes.number.isRequired,
  }).isRequired,
};

export default ProjectsListItem;
