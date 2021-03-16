import React from 'react';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import TableCell from '@material-ui/core/TableCell';
import LayersIcon from '@material-ui/icons/Layers';
import { Link } from 'react-router';
import { makeStyles } from '@material-ui/core/styles';
import { units, black87, checkBlue } from '../../../styles/js/shared';

const useStyles = makeStyles({
  root: {
    // Use flexbox so thumbnail takes up very little space and then text takes
    // the rest. (display: float; is too finicky.)
    display: 'flex',
    minWidth: units(45),
    maxWidth: units(110),
    '&:hover': {
      textDecoration: 'none',
    },
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
  title: ({ isRead }) => ({
    maxHeight: units(5),
    color: black87,
    overflow: 'hidden',
    fontWeight: isRead ? 'normal' : 'bold',
  }),
  description: {
    maxHeight: units(5),
    overflow: 'hidden',
  },
  similarityIcon: {
    marginRight: units(0.5),
    display: 'inline-block',
    verticalAlign: 'middle',
    fontSize: 18,
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

const IconOrNothing = ({ isMain, isSecondary, className }) => {
  if (isMain) {
    return <LayersIcon style={{ color: checkBlue }} className={className} />;
  }
  if (isSecondary) {
    return <LayersIcon style={{ transform: 'rotate(180deg)' }} className={className} />;
  }
  return null;
};

const TitleCell = ({ projectMedia, projectMediaUrl }) => {
  const {
    picture,
    title,
    description,
    is_read: isRead,
    is_main: isMain,
    is_secondary: isSecondary,
  } = projectMedia;
  const classes = useStyles({ isRead });

  return (
    <TableCell className="media__heading" component="th" scope="row">
      <MaybeLink className={classes.root} to={projectMediaUrl}>
        {picture ? (
          <img className={classes.thumbnail} alt="" src={picture} onError={(e) => { e.target.onerror = null; e.target.src = '/images/image_placeholder.svg'; }} />
        ) : null}
        <Box display="flex" alignItems="center">
          <TitleText
            classes={classes}
            title={
              <React.Fragment>
                <IconOrNothing isMain={isMain} isSecondary={isSecondary} className={classes.similarityIcon} />
                {title}
              </React.Fragment>
            }
            description={description}
          />
        </Box>
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
    is_read: PropTypes.bool, // or null
    is_main: PropTypes.bool, // or null
    is_secondary: PropTypes.bool, // or null
  }).isRequired,
  projectMediaUrl: PropTypes.string, // or null
};

export default TitleCell;
