import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import TableCell from '@material-ui/core/TableCell';
import { makeStyles } from '@material-ui/core/styles';
import { units, black87 } from '../../../styles/js/shared';

const useStyles = makeStyles({
  root: {
    // Use flexbox so thumbnail takes up very little space and then text takes
    // the rest. (display: float; is too finicky.)
    display: 'flex',
    minWidth: units(30),
  },
  thumbnail: {
    display: 'block',
    width: units(10),
    height: units(10),
    marginRight: units(1),
    objectFit: 'cover',
    flexShrink: 0,
    flexGrow: 0,
  },
  textBox: {
    // This is a <div>, not a <th> with vertical-align center, because we need
    // to force the height to be `units(10)` plus padding and border. Use
    // flexbox to center vertically.
    display: 'flex',
    flexGrow: 1,
    flexShrink: 1,
    whiteSpace: 'normal',
    overflowWrap: 'anywhere', // long URLs shouldn't affect page width
    height: units(10),
    lineHeight: units(2.5),
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

const TitleText = ({
  classes,
  title,
  description,
}) => (
  <div className={classes.textBox}>
    <h4 className={classes.title}>{title}</h4>
    {description ? (
      <div className={classes.description}>{description}</div>
    ) : null}
  </div>
);

const MaybeLink = ({ to, className, children }) => {
  if (to) {
    return <Link className={className} to={to}>{children}</Link>;
  }
  return <span className={className}>{children}</span>;
};

const TitleCell = ({ projectMedia, projectMediaUrl }) => {
  const {
    picture,
    title,
    description,
  } = projectMedia;
  const classes = useStyles();

  return (
    <TableCell className="media__heading" component="th" scope="row">
      <MaybeLink className={classes.root} to={projectMediaUrl}>
        {picture ? (
          <img className={classes.thumbnail} alt="" src={picture} />
        ) : null}
        <TitleText classes={classes} title={title} description={description} />
      </MaybeLink>
    </TableCell>
  );
};
TitleCell.defaultProps = {
  projectMediaUrl: null,
};
TitleCell.propTypes = {
  projectMedia: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string, // may be empty string or null
    picture: PropTypes.string, // thumbnail URL or null
  }).isRequired,
  projectMediaUrl: PropTypes.string, // or null
};

export default TitleCell;
