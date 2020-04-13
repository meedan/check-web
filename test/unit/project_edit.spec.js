import React from 'react';
import { expect } from 'chai';
import { spy } from 'sinon';
import { FlashMessageSetterContext } from '../../src/app/components/FlashMessage';
import { mountWithIntl, getStore } from './helpers/intl-test';

import { ProjectEditComponent, ConnectedProjectEditComponent } from '../../src/app/components/project/ProjectEdit';

/**
 * Return { wrapper: <ConnectedProjectEditComponent {...props}>, setFlashMessage: spy() }.
 */
const createWrapper = (props) => {
  const setFlashMessage = spy();
  const wrapper = mountWithIntl(
    <FlashMessageSetterContext.Provider value={setFlashMessage}>
      {mountWithIntl(<ConnectedProjectEditComponent {...props} />)}
    </FlashMessageSetterContext.Provider>
  );
  return { wrapper, setFlashMessage };
};

describe('<ProjectEditComponent />', () => {
  it('forbids empty title', function() {
    const team = { slug: 'team-slug' };
    getStore().team = team;
    getStore().dispatch = () => {};

    const { wrapper } = createWrapper({ project: { title: 'Project', description: 'Description', team } });
    let ProjectEdit = wrapper.find(ProjectEditComponent);

    let saveButton = wrapper.find('.project-edit__editing-button--save button');
    expect(saveButton.prop('disabled')).to.equal(true);

    let descriptionField = wrapper.find('#project-title-field').at(1);
    expect(descriptionField.prop('value')).to.equal('Project');

    ProjectEdit.setState({ title: '' });

    descriptionField = wrapper.find('#project-title-field').at(1);
    expect(descriptionField.prop('value')).to.equal('');

    saveButton = wrapper.find('.project-edit__editing-button--save button');
    expect(saveButton.prop('disabled')).to.equal(true);
  });

  it('allows editing title', function() {
    const team = { slug: 'team-slug' };
    getStore().team = team;
    getStore().dispatch = () => {};

    const { wrapper } = createWrapper({ project: { title: 'Project', description: 'Description', team } });
    let ProjectEdit = wrapper.find(ProjectEditComponent);

    let saveButton = wrapper.find('.project-edit__editing-button--save button');
    expect(saveButton.prop('disabled')).to.equal(true);

    let descriptionField = wrapper.find('#project-title-field').at(1);
    expect(descriptionField.prop('value')).to.equal('Project');

    ProjectEdit.setState({ title: 'Edited project' });

    descriptionField = wrapper.find('#project-title-field').at(1);
    expect(descriptionField.prop('value')).to.equal('Edited project');

    saveButton = wrapper.find('.project-edit__editing-button--save button');
    expect(saveButton.prop('disabled')).to.equal(false);
  });

  it('allows editing description', function() {
    const team = { slug: 'team-slug' };
    getStore().team = team;
    getStore().dispatch = () => {};

    const { wrapper } = createWrapper({ project: { title: 'Project', description: 'Description', team } });
    let ProjectEdit = wrapper.find(ProjectEditComponent);

    let saveButton = wrapper.find('.project-edit__editing-button--save button');
    expect(saveButton.prop('disabled')).to.equal(true);

    let descriptionField = wrapper.find('#project-description-field').at(1);
    expect(descriptionField.prop('value')).to.equal('Description');

    ProjectEdit.setState({ description: 'Edited description' });

    descriptionField = wrapper.find('#project-description-field').at(1);
    expect(descriptionField.prop('value')).to.equal('Edited description');

    saveButton = wrapper.find('.project-edit__editing-button--save button');
    expect(saveButton.prop('disabled')).to.equal(false);
  });
});
