import React from 'react';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { injectIntl, intlShape } from 'react-intl';
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
  intl,
}) => {
  const classes = useStyles();

  const handleClick = () => {
    if (onClick) {
      onClick(routePrefix, project.dbid);
    }
    const destination = `/${teamSlug}/${routePrefix}/${project.dbid}`;
    if (window.location.pathname !== destination) {
      browserHistory.push(destination);
    }
  };

  const defaultClassName = ['project-list__link', className].join(' ');

  const Item = listItemProps => (
    <ListItem
      button
      onClick={handleClick}
      title={project.title}
      key={`${project.id}-${project.title}`}
      className={isActive ? [classes.projectsListItemActive, defaultClassName].join(' ') : defaultClassName}
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
        { !Number.isNaN(parseInt(project.medias_count, 10)) ?
          new Intl.NumberFormat(intl.locale, { notation: 'compact', compactDisplay: 'short' }).format(project.medias_count) : null }
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
            <div style={{ display: 'none' }}>
              {provided.placeholder}
            </div>
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
            <Draggable key={project.dbid} draggableId={`draggable-${routePrefix}-${project.id}-${project.project_group_id}`} index={index}>
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
    project_group_id: PropTypes.number,
  }).isRequired,
  intl: intlShape.isRequired,
  onClick: PropTypes.func,
  isActive: PropTypes.bool,
  className: PropTypes.string,
  isDroppable: PropTypes.bool,
  isDraggable: PropTypes.bool,
  index: PropTypes.number,
};

export default injectIntl(ProjectsListItem);
