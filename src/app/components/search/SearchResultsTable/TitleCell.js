import React from 'react';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import TableCell from '@material-ui/core/TableCell';
import LayersIcon from '@material-ui/icons/Layers';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import { Link } from 'react-router';
import { makeStyles } from '@material-ui/core/styles';
import { units, black87, checkBlue, opaqueBlack54, opaqueBlack87 } from '../../../styles/js/shared';

const isTrendsPage = /\/trends$/.test(window.location.pathname);

const useStyles = makeStyles({
  root: {
    // Use flexbox so thumbnail takes up very little space and then text takes
    // the rest. (display: float; is too finicky.)
    display: 'flex',
    minWidth: units(45),
    maxWidth: units(110),
    textDecoration: 'none',
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
  contentScreen: {
    minWidth: units(10),
    minHeight: units(10),
    height: units(10),
    marginRight: units(1),
    backgroundColor: opaqueBlack87,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: '40px',
    color: 'white',
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
    lineHeight: units(2.5),
    flexDirection: 'column',
    justifyContent: 'center',
    minWidth: 470,
  },
  title: ({ isRead }) => ({
    color: black87,
    fontWeight: isRead || isTrendsPage ? 'normal' : 'bold',
    overflow: 'hidden',
    display: '-webkit-box',
    '-webkit-box-orient': 'vertical',
  }),
  description: {
    maxHeight: units(5),
    color: opaqueBlack54,
    overflow: 'hidden',
    display: '-webkit-box',
    '-webkit-box-orient': 'vertical',
    '-webkit-line-clamp': 2,
  },
  similarityIcon: {
    marginRight: units(0.5),
    display: 'inline-block',
    verticalAlign: 'middle',
    fontSize: 18,
  },
  titleViewModeLonger: {
    maxHeight: units(22),
    '-webkit-line-clamp': 4,
  },
  titleViewModeShorter: {
    maxHeight: units(5),
    '-webkit-line-clamp': 2,
  },
  cellViewModeLonger: {
    height: units(15),
  },
  cellViewModeShorter: {
    height: units(10),
  },
});

const TitleText = ({
  classes,
  title,
  description,
  viewMode,
}) => (
  <div className={viewMode === 'longer' ? [classes.textBox, classes.cellViewModeLonger].join(' ') : [classes.textBox, classes.cellViewModeShorter].join(' ')}>
    <h4 className={viewMode === 'longer' ? [classes.title, classes.titleViewModeLonger].join(' ') : [classes.title, classes.titleViewModeShorter].join(' ')}>
      {title}
    </h4>
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
  if (isTrendsPage) {
    return null;
  }
  if (isMain) {
    return <LayersIcon style={{ color: checkBlue }} className={className} />;
  }
  if (isSecondary) {
    return <LayersIcon style={{ transform: 'rotate(180deg)' }} className={className} />;
  }
  return null;
};

const TitleCell = ({ projectMedia, projectMediaUrl, viewMode }) => {
  const {
    picture,
    title,
    description,
    show_warning_cover: maskContent,
    is_read: isRead,
    is_main: isMain,
    is_secondary: isSecondary,
  } = projectMedia;
  const classes = useStyles({ isRead });

  return (
    <TableCell className="media__heading" component="th" scope="row">
      <MaybeLink className={classes.root} to={projectMediaUrl}>
        {picture && !maskContent ? (
          <Box display="flex" alignItems="center">
            <img className={classes.thumbnail} alt="" src={picture} onError={(e) => { e.target.onerror = null; e.target.src = '/images/image_placeholder.svg'; }} />
          </Box>
        ) : null}
        { maskContent ? <Box display="flex" alignItems="center"><div className={classes.contentScreen}><VisibilityOffIcon className={classes.icon} /></div></Box> : null }
        <Box display="flex" alignItems="center">
          <TitleText
            classes={classes}
            title={
              <React.Fragment>
                <IconOrNothing isMain={isMain} isSecondary={isSecondary} className={classes.similarityIcon} />
                {title}
              </React.Fragment>
            }
            description={description === title ? '' : description}
            viewMode={viewMode}
          />
        </Box>
      </MaybeLink>
    </TableCell>
  );
};
TitleCell.defaultProps = {
  projectMediaUrl: null,
  viewMode: 'shorter',
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
  viewMode: PropTypes.oneOf(['shorter', 'longer']),
};

export default TitleCell;
