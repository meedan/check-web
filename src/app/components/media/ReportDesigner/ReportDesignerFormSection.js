import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import withStyles from '@material-ui/core/styles/withStyles';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import ExpandMoreIcon from '../../../icons/expand_more.svg';

const useStyles = makeStyles(() => ({
  accordionDetails: {
    display: 'block',
  },
  reportMessage: {
    boxShadow: 'none',
    border: '1px solid var(--brandBorder)',
    borderRadius: '5px',
  },
}));

const IconLeftAccordionSummary = withStyles({
  expandIcon: {
    order: -1,
    marginLeft: 0,
    marginRight: 0,
  },
})(AccordionSummary);

const ReportDesignerFormSection = (props) => {
  const classes = useStyles();
  const {
    label,
    enabled,
    onToggle,
  } = props;
  const [expanded, setExpanded] = React.useState(enabled);

  const handleClick = (e) => {
    if (enabled) {
      setExpanded(!expanded);
    }
    e.stopPropagation();
    e.preventDefault();
  };

  const handleToggle = (e) => {
    setExpanded(e.target.checked);
    onToggle(e.target.checked);
  };

  return (
    <Accordion
      className={classes.reportMessage}
      TransitionProps={{ unmountOnExit: true }}
      expanded={expanded}
    >
      <IconLeftAccordionSummary
        expandIcon={<ExpandMoreIcon />}
        onClick={handleClick}
      >
        <FormControlLabel
          onClick={e => e.stopPropagation()}
          onFocus={e => e.stopPropagation()}
          control={
            <Checkbox
              onChange={handleToggle}
              checked={enabled}
            />
          }
          label={<strong>{label}</strong>}
        />
      </IconLeftAccordionSummary>
      <AccordionDetails className={classes.accordionDetails}>
        {props.children}
      </AccordionDetails>
    </Accordion>
  );
};

ReportDesignerFormSection.propTypes = {
  label: PropTypes.object.isRequired,
  enabled: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default ReportDesignerFormSection;
