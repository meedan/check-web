import React from 'react';
import PropTypes from 'prop-types';
import TableCell from '@material-ui/core/TableCell';
import { makeStyles } from '@material-ui/core/styles';
import { units, black87, Offset } from '../../../styles/js/shared';

const useStyles = makeStyles({
  thumbnail: {
    width: units(10),
    height: units(10),
  },
  fullHeightImg: {
    height: '100%',
    objectFit: 'cover',
  },
  content: props => ({
    cursor: props.optimistic ? 'wait' : 'pointer',
    whiteSpace: 'normal',
    height: units(12),
    padding: [units(1), 0],
    color: black87,
    lineHeight: units(2.5),
  }),
  title: {
    minHeight: units(5),
    maxHeight: units(5),
    overflow: 'hidden',
  },
  description: {
    minHeight: units(5),
    maxHeight: units(5),
    overflow: 'hidden',
  },
});

const TitleCell = ({ projectMedia }) => {
  const {
    thumbnailUrl,
    title,
    description,
    dbid, // if truthy, this media has been saved to the server
  } = projectMedia;
  const classes = useStyles({ optimistic: !dbid });

  return (
    <TableCell component="th" scope="row">
      {thumbnailUrl ? (
        <Offset>
          <div className={classes.thumbnail}>
            <img className={classes.fullHeightImg} alt="" src={thumbnailUrl} />
          </div>
        </Offset>
      ) : null}
      <div className={classes.content}>
        <h4 className={classes.title}>{title}</h4>
        {description ? (
          <div className={classes.description}>{description}</div>
        ) : null}
      </div>
    </TableCell>
  );
};
TitleCell.propTypes = {
  projectMedia: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired, // may be empty string
    thumbnailUrl: PropTypes.string, // or null
    url: PropTypes.string, // or null
    query: PropTypes.object, // or null
  }).isRequired,
};

export default TitleCell;
