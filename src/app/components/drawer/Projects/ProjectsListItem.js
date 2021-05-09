import React from 'react';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { makeStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import { brandSecondary } from '../../../styles/js/shared';

const useStyles = makeStyles(theme => ({
  projectsListItemLabel: {
    fontSize: 14,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  projectsListItemActive: {
    background: brandSecondary,
  },
  projectsListItemActiveText: {
    fontWeight: 'bold',
  },
  projectsListItemIcon: {
    minWidth: theme.spacing(4),
  },
}));

function kFormatter(num) {
  // https://stackoverflow.com/a/9461657
  return Math.abs(num) > 999 ? `${Math.sign(num) * ((Math.abs(num) / 1000).toFixed(1))}k` : Math.sign(num) * Math.abs(num);
}

const ProjectsListItem = ({
  onClick,
  isActive,
  className,
  teamSlug,
  project,
  icon,
  routePrefix,
}) => {
  const classes = useStyles();

  const handleClick = () => {
    if (onClick) {
      onClick(routePrefix, project.dbid);
    }
    browserHistory.push(`/${teamSlug}/${routePrefix}/${project.dbid}`);
  };

  return (
    <ListItem
      button
      onClick={handleClick}
      title={project.title}
      className={isActive ? [classes.projectsListItemActive, className] : className}
    >
      <ListItemIcon className={classes.projectsListItemIcon}>
        {icon}
      </ListItemIcon>
      <ListItemText classes={{ primary: classes.projectsListItemLabel }}>
        <span className={isActive ? classes.projectsListItemActiveText : ''}>
          {project.title}
        </span>
      </ListItemText>
      <ListItemSecondaryAction>
        {kFormatter(parseInt(project.medias_count, 10))}
      </ListItemSecondaryAction>
    </ListItem>
  );
};

ProjectsListItem.defaultProps = {
  onClick: null,
  isActive: false,
  className: '',
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
  onClick: PropTypes.func,
  isActive: PropTypes.bool,
  className: PropTypes.string,
};

export default ProjectsListItem;
