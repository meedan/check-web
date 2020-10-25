import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import withStyles from '@material-ui/core/styles/withStyles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { checkBlue, backgroundMain, brandSecondary } from '../../../styles/js/shared';

const useStyles = makeStyles(() => ({
  expansionPanelDetails: {
    display: 'block',
  },
  reportMessage: {
    boxShadow: 'none',
    border: '1px solid #DFE4F4',
    borderRadius: '5px',
  }
}));

const IconLeftExpansionPanelSummary = withStyles({
  expandIcon: {
    order: -1,
    marginLeft: 0,
    marginRight: 0,
  },
})(ExpansionPanelSummary);

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
    <ExpansionPanel
      className={classes.reportMessage}
      TransitionProps={{ unmountOnExit: true }}
      expanded={expanded}
    >
      <IconLeftExpansionPanelSummary
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
      </IconLeftExpansionPanelSummary>
      <ExpansionPanelDetails className={classes.expansionPanelDetails}>
        {props.children}
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};

ReportDesignerFormSection.propTypes = {
  label: PropTypes.object.isRequired,
  enabled: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default ReportDesignerFormSection;
