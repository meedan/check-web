import React from 'react';
import PropTypes from 'prop-types';
import TableCell from '@material-ui/core/TableCell';
import { makeStyles } from '@material-ui/core/styles';
import { units, black87 } from '../../../styles/js/shared';

const useStyles = makeStyles({
  thumbnail: ({ isRtl }) => ({
    width: units(10),
    height: units(10),
    overflow: 'hidden',
    float: isRtl ? 'right' : 'left',
    [`margin${isRtl ? 'Left' : 'Right'}`]: units(2),
  }),
  fullHeightImg: {
    height: '100%',
    objectFit: 'cover',
  },
  content: {
    whiteSpace: 'normal',
    height: units(10),
    color: black87,
    lineHeight: units(2.5),
  },
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

const TitleCell = ({ projectMedia, isRtl }) => {
  const {
    picture,
    title,
    description,
  } = projectMedia;
  const classes = useStyles({ isRtl });

  return (
    <TableCell component="th" scope="row">
      {picture ? (
        <div className={classes.thumbnail}>
          <img className={classes.fullHeightImg} alt="" src={picture} />
        </div>
      ) : null}
      <div className={classes.content}>
        <h4 className={`media__heading ${classes.title}`}>{title}</h4>
        {description ? (
          <div className={classes.description}>{description}</div>
        ) : null}
      </div>
    </TableCell>
  );
};
TitleCell.propTypes = {
  isRtl: PropTypes.bool.isRequired,
  projectMedia: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired, // may be empty string
    picture: PropTypes.string, // thumbnail URL or null
  }).isRequired,
};

export default TitleCell;
