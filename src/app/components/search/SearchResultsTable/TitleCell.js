import React from 'react';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import TableCell from '@material-ui/core/TableCell';
import ContentCopyIcon from '@material-ui/icons/ContentCopy';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import Typography from '@material-ui/core/Typography';
import { Link } from 'react-router';
import { makeStyles } from '@material-ui/core/styles';
import { units } from '../../../styles/js/shared';

const isFeedPage = () => (/\/feed/.test(window.location.pathname));

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
    backgroundColor: 'var(--textPrimary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: '40px',
    color: 'var(--otherWhite)',
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
    color: 'var(--textPrimary)',
    fontWeight: !isRead || isFeedPage() ? 'bold' : 'normal',
    overflow: 'hidden',
    display: '-webkit-box',
    '-webkit-box-orient': 'vertical',
  }),
  description: {
    maxHeight: units(5),
    color: 'var(--textSecondary)',
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
  titleViewModeShorter: {
    maxHeight: units(5),
    '-webkit-line-clamp': 2,
  },
  cellViewModeShorter: {
    height: units(10),
  },
});

const TitleText = ({
  classes,
  title,
  description,
}) => (
  <div className={[classes.textBox, classes.cellViewModeShorter].join(' ')}>
    <Typography variant="body1" className={[classes.title, classes.titleViewModeShorter].join(' ')}>
      {title}
    </Typography>
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

const IconOrNothing = ({
  isMain,
  isConfirmed,
  isSuggested,
  className,
}) => {
  if (isFeedPage()) {
    return null;
  }
  if (isMain) {
    return <ContentCopyIcon style={{ color: 'var(--brandMain)' }} className={`${className} similarity-is-main`} />;
  }
  if (isConfirmed) {
    return <ContentCopyIcon style={{ transform: 'rotate(180deg)' }} className={`${className} similarity-is-confirmed`} />;
  }
  if (isSuggested) {
    return <ContentCopyIcon style={{ color: 'var(--alertMain)' }} className={`${className} similarity-is-suggested`} />;
  }
  return null;
};

const TitleCell = ({ projectMedia, projectMediaUrl }) => {
  const {
    picture,
    title,
    description,
    show_warning_cover: maskContent,
    is_read: isRead,
    is_main: isMain,
    is_suggested: isSuggested,
    is_confirmed: isConfirmed,
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
                <IconOrNothing isMain={isMain} isConfirmed={isConfirmed} isSuggested={isSuggested} className={classes.similarityIcon} />
                {title}
              </React.Fragment>
            }
            description={description === title ? '' : description}
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
    is_confirmed: PropTypes.bool, // or null
    is_suggested: PropTypes.bool, // or null
  }).isRequired,
  projectMediaUrl: PropTypes.string, // or null
};

export default TitleCell;
