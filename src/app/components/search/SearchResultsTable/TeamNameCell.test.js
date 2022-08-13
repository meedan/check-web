import React from 'react';
import TeamNameCell from './TeamNameCell';
import { mountWithIntlProvider } from '../../../../../test/unit/helpers/intl-test';

function mountInTable(value) {
  const tree = mountWithIntlProvider((
    <table>
      <tbody>
        <tr>
          {value}
        </tr>
      </tbody>
    </table>
  ));
  return tree.find('tr>*');
}

const projectMedia = {
  list_columns_values: {
    team_name: 'Test'
  },
};

describe('<TeamNameCell>', () => {
  it('should render title', () => {
    const cell = mountInTable(<TeamNameCell projectMedia={projectMedia} />);
    expect(cell.find('span').text()).toEqual('Test');
  });
});
