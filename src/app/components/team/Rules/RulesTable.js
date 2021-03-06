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
  rulesTable: {
    width: '100%',
  },
  paper: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  tableRow: {
    cursor: 'pointer',
  },
  rulesTableCell: {
    borderBottom: 0,
  },
  rulesTableTime: {
    whiteSpace: 'nowrap',
  },
}));

export default function RulesTable(props) {
  const { rules } = props;
  const rows = rules.map((rule, index) => ({
    name: rule.name,
    updated_at: rule.updated_at,
    actions: rule.actions,
    index,
  }));

  const classes = useStyles();
  const [selected, setSelected] = React.useState([]);
  const [orderBy, setOrderBy] = React.useState('updated_at');
  const [order, setOrder] = React.useState('asc');

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
    props.onAddRule();
  };

  const handleClick = (index) => {
    props.onClickRule(index);
  };

  const handleDelete = () => {
    props.onDeleteRules(selected.slice(0));
    setSelected([]);
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const isSelected = index => selected.indexOf(index) !== -1;

  const sortedRows = rows.sort((a, b) => {
    if (orderBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (orderBy === 'updated_at') {
      return a.updated_at > b.updated_at ? -1 : 1;
    }
    return 1;
  });
  if (order === 'desc') {
    sortedRows.reverse();
  }

  return (
    <React.Fragment>
      <RulesTableToolbar
        numSelected={selected.length}
        onAddNewRule={handleNewRule}
        onDeleteRules={handleDelete}
      />
      <div className={classes.rulesTable}>
        <Paper className={classes.paper}>
          <TableContainer>
            <Table size="medium" id="rules-table">
              <RulesTableHead
                order={order}
                orderBy={orderBy}
                onSort={handleSort}
              />
              <TableBody>
                {sortedRows.filter(r => !/add_tag/.test(JSON.stringify(r.actions))).map((row) => {
                  const { name, index } = row;
                  const isItemSelected = isSelected(index);
                  const labelId = `rules-table-checkbox-${index}`;
                  const date = new Date(row.updated_at * 1000);

                  return (
                    <TableRow
                      hover
                      className={classes.tableRow}
                      onClick={() => { handleClick(index); }}
                      key={row.index}
                    >
                      <TableCell className={classes.rulesTableCell} padding="checkbox">
                        <Checkbox
                          checked={isItemSelected}
                          onClick={(event) => { handleChange(event, index); }}
                          inputProps={{ 'aria-labelledby': labelId }}
                        />
                      </TableCell>
                      <TableCell className={classes.rulesTableCell} component="th" id={labelId} scope="row">
                        {name}
                      </TableCell>
                      <TableCell className={classes.rulesTableCell}>
                        <time className={classes.rulesTableTime} dateTime={date.toISOString()}>
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
    </React.Fragment>
  );
}

RulesTable.propTypes = {
  rules: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
  onClickRule: PropTypes.func.isRequired,
  onAddRule: PropTypes.func.isRequired,
  onDeleteRules: PropTypes.func.isRequired,
};
