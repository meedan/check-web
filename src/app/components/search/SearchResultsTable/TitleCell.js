import React from 'react';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import TableCell from '@material-ui/core/TableCell';
import { Link } from 'react-router';
import { makeStyles } from '@material-ui/core/styles';
import ContentCopyIcon from '../../../icons/content_copy.svg';
import ItemThumbnail from './ItemThumbnail';

const isFeedPage = () => (/\/feed/.test(window.location.pathname));

const useStyles = makeStyles({
  root: {
    // Use flexbox so thumbnail takes up very little space and then text takes
    // the rest. (display: float; is too finicky.)
    display: 'flex',
    minWidth: '360px',
    maxWidth: '880px',
    textDecoration: 'none',
  },
  icon: {
    fontSize: '40px',
    color: 'var(--color-white-100)',
  },
  textBox: {
    // This is a <div>, not a <th> with vertical-align center, because we need
    // to force the height to be `80px` plus padding and border. Use
    // flexbox to center vertically.
    display: 'flex',
    flexGrow: 1,
    flexShrink: 1,
    whiteSpace: 'normal',
    overflowWrap: 'anywhere', // long URLs shouldn't affect page width
    lineHeight: '20px',
    flexDirection: 'column',
    justifyContent: 'center',
    minWidth: 470,
  },
  title: ({ isRead }) => ({
    color: 'var(--color-gray-15)',
    fontWeight: !isRead || isFeedPage() ? 'bold' : 'normal',
    overflow: 'hidden',
    display: '-webkit-box',
    '-webkit-box-orient': 'vertical',
    marginBottom: 0,
  }),
  description: {
    maxHeight: '40px',
    color: 'var(--color-gray-37)',
    overflow: 'hidden',
    display: '-webkit-box',
    '-webkit-box-orient': 'vertical',
    '-webkit-line-clamp': 2,
  },
  similarityIcon: {
    marginRight: '4px',
    display: 'inline-block',
    verticalAlign: 'middle',
    fontSize: 18,
  },
  titleViewModeShorter: {
    maxHeight: '40px',
    '-webkit-line-clamp': 2,
  },
  cellViewModeShorter: {
    height: '80px',
  },
  itemThumbnail: {
    marginRight: '8px',
  },
});

const TitleText = ({
  classes,
  title,
  description,
}) => (
  <div className={[classes.textBox, classes.cellViewModeShorter].join(' ')}>
    <p className={[classes.title, classes.titleViewModeShorter].join(' ')}>
      {title}
    </p>
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
    return <ContentCopyIcon style={{ color: 'var(--color-blue-54)' }} className={`${className} similarity-is-main`} />;
  }
  if (isConfirmed) {
    return <ContentCopyIcon style={{ transform: 'rotate(180deg)' }} className={`${className} similarity-is-confirmed`} />;
  }
  if (isSuggested) {
    return <ContentCopyIcon style={{ color: 'var(--color-orange-54)' }} className={`${className} similarity-is-suggested`} />;
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
        <Box display="flex" alignItems="center" >
          <div className={classes.itemThumbnail}>
            <ItemThumbnail picture={picture} maskContent={maskContent} type={projectMedia.type} url={projectMedia?.media?.url} />
          </div>
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
