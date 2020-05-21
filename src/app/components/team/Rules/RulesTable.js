import React from 'react';
import PropTypes from 'prop-types';
import { FormattedRelative } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import RulesTableToolbar from './RulesTableToolbar';
import RulesTableHead from './RulesTableHead';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
  },
  paper: {
    width: '100%',
    marginBottom: theme.spacing(2),
    boxShadow: 'none',
  },
  tableRow: {
    cursor: 'pointer',
  },
}));

export default function RulesTable(props) {
  const { rules } = props;
  const rows = rules.map((rule, index) => (
    { name: rule.name, created_at: rule.created_at, index }
  ));

  const classes = useStyles();
  const [selected, setSelected] = React.useState([]);

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = rows.map(n => n.index);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleChange = (event, index) => {
    const newSelected = selected.slice(0);
    if (event.target.checked) {
      newSelected.push(index);
    } else {
      const selectedIndex = selected.indexOf(index);
      newSelected.splice(selectedIndex, 1);
    }
    setSelected(newSelected);
    event.stopPropagation();
  };

  const handleNewRule = () => {
    const updatedRules = rules.slice(0);
    const newRule = {
      name: '',
      created_at: null,
      rules: {
        operator: 'and',
        groups: [
          {
            operator: 'and',
            conditions: [
              {
                rule_definition: '',
                rule_value: '',
              },
            ],
          },
        ],
      },
      actions: [
        {
          action_definition: '',
          action_value: '',
        },
      ],
    };
    updatedRules.push(newRule);
    props.onUpdateRules(updatedRules, false);
    props.onSetCurrentRuleIndex(updatedRules.length - 1);
  };

  const handleClick = (event, index) => {
    props.onSetCurrentRuleIndex(index);
  };

  const handleDelete = () => {
    const updatedRules = rules.slice(0);
    selected.sort().reverse().forEach((index) => { updatedRules.splice(index, 1); });
    setSelected([]);
    props.onUpdateRules(updatedRules);
  };

  const isSelected = index => selected.indexOf(index) !== -1;

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <RulesTableToolbar
          numSelected={selected.length}
          numRules={rows.length}
          onAddNewRule={handleNewRule}
          onDeleteRules={handleDelete}
        />
        <TableContainer>
          <Table size="medium">
            <RulesTableHead
              numSelected={selected.length}
              onSelectAllClick={handleSelectAllClick}
              rowCount={rows.length}
            />
            <TableBody>
              {rows.map((row, index) => {
                const isItemSelected = isSelected(index);
                const labelId = `rules-table-checkbox-${index}`;
                const { name } = row;
                const date = new Date(row.created_at * 1000);

                return (
                  <TableRow
                    hover
                    className={classes.tableRow}
                    onClick={(event) => { handleClick(event, index); }}
                    key={row.index}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isItemSelected}
                        onClick={(event) => { handleChange(event, index); }}
                        inputProps={{ 'aria-labelledby': labelId }}
                      />
                    </TableCell>
                    <TableCell component="th" id={labelId} scope="row">
                      {name}
                    </TableCell>
                    <TableCell>
                      <time dateTime={date.toISOString()}>
                        <FormattedRelative value={date} />
                      </time>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </div>
  );
}

RulesTable.propTypes = {
  rules: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
  onUpdateRules: PropTypes.func.isRequired,
  onSetCurrentRuleIndex: PropTypes.func.isRequired,
};
