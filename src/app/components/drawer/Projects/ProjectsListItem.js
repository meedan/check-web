import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { browserHistory } from 'react-router';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import RootRef from '@material-ui/core/RootRef';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import styles from './Projects.module.css';

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
  routeSuffix,
  intl,
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(routePrefix, project.dbid);
      browserHistory.push(`/${teamSlug}/${routePrefix}/${project.dbid}${routeSuffix}`);
    }
  };

  const defaultClassName = ['project-list__link', className].join(' ');

  const Item = listItemProps => (
    <ListItem
      button
      onClick={handleClick}
      title={project.title}
      key={`${project.id}-${project.title}`}
      className={[defaultClassName, styles.projectsListItem, (isActive ? styles.projectsListItemActive : '')].join(' ')}
      {...listItemProps}
    >
      {icon &&
        <div className={styles.projectsListItemIcon}>
          {icon}
        </div>
      }
      <ListItemText disableTypography className={styles.projectsListItemLabel}>
        <span>
          {project.title || project.name}
        </span>
      </ListItemText>
      <ListItemSecondaryAction disableTypography title={project.medias_count} className={styles.projectsListItemCount}>
        { !Number.isNaN(parseInt(project.medias_count, 10)) ?
          new Intl.NumberFormat(intl.locale, { notation: 'compact', compactDisplay: 'short' }).format(project.medias_count) : null }
      </ListItemSecondaryAction>
    </ListItem>
  );

  const droppableId = `droppable-${routePrefix}-${project.dbid}-${project.project_group_id}`;

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
  icon: null,
  index: null,
  onClick: null,
  isActive: false,
  className: '',
  isDroppable: false,
  isDraggable: false,
  routeSuffix: '',
};

ProjectsListItem.propTypes = {
  teamSlug: PropTypes.string.isRequired,
  icon: PropTypes.node,
  routePrefix: PropTypes.string.isRequired,
  routeSuffix: PropTypes.string,
  project: PropTypes.shape({
    id: PropTypes.string.isRequired,
    dbid: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    medias_count: PropTypes.number,
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
