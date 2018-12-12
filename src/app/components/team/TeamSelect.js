import React from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import TeamAvatar from './TeamAvatar';
import { units, Row, HeaderTitle, OffsetBothSides } from '../../styles/js/shared';

const TeamSelect = (props) => {
  const renderValue = (value) => {
    const selectedTeam = props.teams.find(t => String(t.node.dbid) === value);
    const team = selectedTeam ? selectedTeam.node : { avatar: null };
    const name = selectedTeam ? selectedTeam.node.name : null;

    return (
      <Row>
        <TeamAvatar
          team={team}
        />
        <OffsetBothSides>
          <HeaderTitle>
            {name}
          </HeaderTitle>
        </OffsetBothSides>
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
              <OffsetBothSides>
                {t.node.name}
              </OffsetBothSides>
            </MenuItem>
          ))
        }
      </Select>
    </FormControl>
  );
};

export default TeamSelect;
