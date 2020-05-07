import React from 'react';
import PropTypes from 'prop-types';
import TableCell from '@material-ui/core/TableCell';
import { makeStyles } from '@material-ui/core/styles';
import { units, black87 } from '../../../styles/js/shared';

const useStyles = makeStyles({
  thumbnailCell: {
    paddingRight: 0, // paddingLeft, if jss-rtl is flipping it
  },
  thumbnail: {
    width: units(10),
    height: units(10),
    objectFit: 'cover',
  },
  textBox: {
    // This is a <div>, not a <th> with vertical-align center, because we need
    // to force the height to be `units(10)` plus padding and border. Use
    // flexbox to center vertically.
    whiteSpace: 'normal',
    height: units(10),
    lineHeight: units(2.5),
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  title: {
    maxHeight: units(5),
    color: black87,
    overflow: 'hidden',
  },
  description: {
    maxHeight: units(5),
    overflow: 'hidden',
  },
});

const TextCell = ({
  classes,
  colspan,
  title,
  description,
}) => (
  <TableCell colspan={colspan} component="th" scope="row">
    <div className={classes.textBox}>
      <h4 className={`media__heading ${classes.title}`}>{title}</h4>
      {description ? (
        <div className={classes.description}>{description}</div>
      ) : null}
    </div>
  </TableCell>
);

const TitleCell = ({ projectMedia }) => {
  const {
    picture,
    title,
    description,
  } = projectMedia;
  const classes = useStyles();

  if (picture) {
    return (
      <React.Fragment>
        <TableCell className={classes.thumbnailCell}>
          <img className={classes.thumbnail} alt="" src={picture} />
        </TableCell>
        <TextCell classes={classes} title={title} description={description} />
      </React.Fragment>
    );
  }

  return (
    <TextCell
      classes={classes}
      title={title}
      description={description}
      colspan={2}
    />
  );
};
TitleCell.propTypes = {
  projectMedia: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired, // may be empty string
    picture: PropTypes.string, // thumbnail URL or null
  }).isRequired,
};

export default TitleCell;
