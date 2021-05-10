import React from 'react';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { makeStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import RootRef from '@material-ui/core/RootRef';
import { Droppable, Draggable } from 'react-beautiful-dnd';
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
  if (Number.isNaN(num)) {
    return null;
  }
  // https://stackoverflow.com/a/9461657
  return Math.abs(num) > 999 ? `${Math.sign(num) * ((Math.abs(num) / 1000).toFixed(1))}k` : Math.sign(num) * Math.abs(num);
}

const ProjectsListItem = ({
  index,
  onClick,
  isActive,
  isDroppable,
  isDraggable,
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

  const Item = listItemProps => (
    <ListItem
      button
      onClick={handleClick}
      title={project.title}
      className={isActive ? [classes.projectsListItemActive, className] : className}
      {...listItemProps}
    >
      <ListItemIcon className={classes.projectsListItemIcon}>
        {icon}
      </ListItemIcon>
      <ListItemText classes={{ primary: classes.projectsListItemLabel }}>
        <span className={isActive ? classes.projectsListItemActiveText : ''}>
          {project.title}
        </span>
      </ListItemText>
      <ListItemSecondaryAction title={project.medias_count}>
        {kFormatter(parseInt(project.medias_count, 10))}
      </ListItemSecondaryAction>
    </ListItem>
  );

  const droppableId = `droppable-${routePrefix}-${project.dbid}`;

  if (isDroppable) {
    return (
      <Droppable droppableId={droppableId}>
        {provided => (
          <RootRef rootRef={provided.innerRef}>
            <Item />
            {provided.placeholder}
          </RootRef>
        )}
      </Droppable>
    );
  }

  if (isDraggable) {
    return (
      <Droppable droppableId={droppableId}>
        {provided => (
          <RootRef rootRef={provided.innerRef}>
            <Draggable key={project.dbid} draggableId={`draggable-${routePrefix}-${project.id}`} index={index}>
              {provided2 => (
                <Item
                  ContainerComponent="li"
                  ContainerProps={{ ref: provided2.innerRef }}
                  {...provided2.draggableProps}
                  {...provided2.dragHandleProps}
                />
              )}
            </Draggable>
            {provided.placeholder}
          </RootRef>
        )}
      </Droppable>
    );
  }

  return <Item />;
};

ProjectsListItem.defaultProps = {
  index: null,
  onClick: null,
  isActive: false,
  className: '',
  isDroppable: false,
  isDraggable: false,
};

ProjectsListItem.propTypes = {
  teamSlug: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  routePrefix: PropTypes.string.isRequired,
  project: PropTypes.shape({
    id: PropTypes.string.isRequired,
    dbid: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    medias_count: PropTypes.number.isRequired,
  }).isRequired,
  onClick: PropTypes.func,
  isActive: PropTypes.bool,
  className: PropTypes.string,
  isDroppable: PropTypes.bool,
  isDraggable: PropTypes.bool,
  index: PropTypes.number,
};

export default ProjectsListItem;
