import React from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import { makeStyles } from '@material-ui/core/styles';
import TeamAvatar from './TeamAvatar';
import { units, Row, HeaderTitle } from '../../styles/js/shared';

const useStyles = makeStyles(theme => ({
  padBothSides: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
}));

const TeamSelect = (props) => {
  const classes = useStyles();

  const renderValue = (value) => {
    const selectedTeam = props.teams.find(t => String(t.node.dbid) === value);
    const team = selectedTeam ? selectedTeam.node : { avatar: null };
    const name = selectedTeam ? selectedTeam.node.name : null;

    return (
      <Row>
        <TeamAvatar team={team} />
        <div className={classes.padBothSides}>
          <HeaderTitle>
            {name}
          </HeaderTitle>
        </div>
      </Row>
    );
  };

  return (
    <FormControl variant="outlined">
      <Select
        className="team-select"
        input={<OutlinedInput name="team-select" labelWidth={0} />}
        style={{ minWidth: units(20), ...props.style }}
        renderValue={renderValue}
        {...props}
      >
        {
          props.teams.map(t => (
            <MenuItem className={`team-${t.node.slug}`} key={t.node.slug} value={t.node.dbid}>
              <TeamAvatar team={t.node} />
              <div className={classes.padBothSides}>
                {t.node.name}
              </div>
            </MenuItem>
          ))
        }
      </Select>
    </FormControl>
  );
};

export default TeamSelect;
