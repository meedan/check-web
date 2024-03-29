import React from 'react';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import TableCell from '@material-ui/core/TableCell';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import {
  units,
} from '../../../styles/js/shared';

const useStyles = makeStyles({
  root: {
    // Use flexbox so thumbnail takes up very little space and then text takes
    // the rest. (display: float; is too finicky.)
    display: 'flex',
    minWidth: units(45),
    maxWidth: units(110),
    textDecoration: 'none',
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
  title: {
    color: 'var(--textPrimary)',
    fontWeight: 'bold',
    overflow: 'hidden',
    display: '-webkit-box',
    '-webkit-box-orient': 'vertical',
  },
  description: {
    maxHeight: units(5),
    color: 'var(--textSecondary)',
    overflow: 'hidden',
    display: '-webkit-box',
    '-webkit-box-orient': 'vertical',
    '-webkit-line-clamp': 2,
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
      <div className={[classes.description, 'fact-check-cell__description'].join(' ')}>{description}</div>
    ) : null}
  </div>
);

const MaybeLink = ({ to, className, children }) => {
  if (to) {
    return <a href={to} className={className} target="_blank" rel="noreferrer noopener">{children}</a>;
  }
  return <span className={className}>{children}</span>;
};

const FactCheckCell = ({ projectMedia }) => {
  const title = projectMedia.feed_columns_values?.fact_check_title;
  const summary = projectMedia.feed_columns_values?.fact_check_summary;
  const url = projectMedia.feed_columns_values?.fact_check_url;
  const classes = useStyles();
  const isBlank = !summary && !title;

  return (
    <TableCell className="media__heading" component="th" scope="row">
      {isBlank ? <Box>-</Box> : (
        <MaybeLink className={classes.root} to={url}>
          <Box display="flex" alignItems="center">
            <TitleText
              classes={classes}
              title={title}
              description={summary}
            />
          </Box>
        </MaybeLink>
      )}
    </TableCell>
  );
};

FactCheckCell.propTypes = {
  projectMedia: PropTypes.shape({
    feed_columns_values: PropTypes.shape({
      fact_check_title: PropTypes.string, // or null
      fact_check_summary: PropTypes.string, // or null
      fact_check_url: PropTypes.string, // or null
    }).isRequired,
  }).isRequired,
};

export default FactCheckCell;
