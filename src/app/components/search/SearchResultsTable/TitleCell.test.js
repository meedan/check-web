import React from 'react';
import TitleCell from './TitleCell';
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

describe('<TitleCell>', () => {
  it('should render title', () => {
    const cell = mountInTable(<TitleCell
      projectMedia={{
        title: 'Title of item',
      }}
    />);
    expect(cell.find('p').text()).toEqual('Title of item');
  });

  it('should render appropriate similarity icons', () => {
    const cellMain = mountInTable(<TitleCell
      projectMedia={{
        title: 'Title of item',
        description: 'This is a longer description', // may be empty string or null
        picture: null, // thumbnail URL or null
        is_read: false, // or null
        is_main: true, // or null
        is_confirmed: false, // or null
        is_suggested: false, // or null
      }}
    />);
    expect(cellMain.find('svg.similarity-is-main').length).toEqual(1);
    expect(cellMain.find('svg.similarity-is-confirmed').length).toEqual(0);
    expect(cellMain.find('svg.similarity-is-suggested').length).toEqual(0);

    const cellSecondary = mountInTable(<TitleCell
      projectMedia={{
        title: 'Title of item',
        description: 'This is a longer description', // may be empty string or null
        picture: null, // thumbnail URL or null
        is_read: false, // or null
        is_main: false, // or null
        is_confirmed: true, // or null
        is_suggested: false, // or null
      }}
    />);
    expect(cellSecondary.find('svg.similarity-is-main').length).toEqual(0);
    expect(cellSecondary.find('svg.similarity-is-confirmed').length).toEqual(1);
    expect(cellSecondary.find('svg.similarity-is-suggested').length).toEqual(0);

    const cellHasMain = mountInTable(<TitleCell
      projectMedia={{
        title: 'Title of item',
        description: 'This is a longer description', // may be empty string or null
        picture: null, // thumbnail URL or null
        is_read: false, // or null
        is_main: false, // or null
        is_confirmed: false, // or null
        is_suggested: true, // or null
      }}
    />);
    expect(cellHasMain.find('svg.similarity-is-main').length).toEqual(0);
    expect(cellHasMain.find('svg.similarity-is-confirmed').length).toEqual(0);
    expect(cellHasMain.find('svg.similarity-is-suggested').length).toEqual(1);
  });
});
