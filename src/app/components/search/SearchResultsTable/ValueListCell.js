import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import TableCell from '@material-ui/core/TableCell';
import { makeStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import { checkBlue, inProgressYellow } from '../../../styles/js/shared';

const useStyles = makeStyles({
  tableCell: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  chip: {
    color: 'white',
    fontSize: 12,
  },
  noFactCheck: {
    background: inProgressYellow,
  },
  more: {
    background: checkBlue,
  },
});

export default function ValueListCell({
  values,
  noValueLabel,
  onClick,
  randomizeOrder,
  renderNoValueAsChip,
}) {
  const classes = useStyles();
  const [showMore, setShowMore] = React.useState(false);

  function handleMoreChipClick(e) {
    e.stopPropagation();
    setShowMore(true);
  }

  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) onClick();
  };

  let content = renderNoValueAsChip ? (
    <Chip
      size="small"
      className={[classes.chip, classes.noFactCheck].join(' ')}
      label={noValueLabel}
    />
  ) : noValueLabel;
  if (values && values.length > 0) {
    const labels = [];
    let more = 0;
    if (randomizeOrder) {
      values.sort(() => Math.random() - 0.5);
    }
    values.forEach((name, i) => {
      if (showMore || i < 2) {
        labels.push(<div key={name}>{name}</div>);
      } else {
        more += 1;
      }
    });
    if (!showMore && more > 0) {
      labels.push(
        <Chip
          size="small"
          className={[classes.chip, classes.more].join(' ')}
          onClick={handleMoreChipClick}
          label={
            <FormattedMessage
              id="valueListCell.more"
              defaultMessage="+{number} more"
              values={{ number: more }}
              description="Button to maximize list display (tags, urls, checked options) with all values within a table cell"
            />
          }
        />,
      );
    }
    content = labels;
  }

  return <TableCell onClick={handleClick} className={classes.tableCell}>{content}</TableCell>;
}

ValueListCell.defaultProps = {
  renderNoValueAsChip: false,
  noValueLabel: '-',
};
ValueListCell.propTypes = {
  values: PropTypes.arrayOf(PropTypes.node.isRequired).isRequired,
  noValueLabel: PropTypes.node,
  renderNoValueAsChip: PropTypes.bool,
};
