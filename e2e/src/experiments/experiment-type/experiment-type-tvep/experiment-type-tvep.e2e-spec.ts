import { browser } from 'protractor';

import { ExperimentType } from '@stechy1/diplomka-share';

import { ApplicationPage } from '../../../app.po';
import { ExperimentsPage } from '../../experiments.po';
import { ExperimentTypeAbstractSpecHelper } from '../experiment-type-abstract-helper.spec';
import { ExperimentTypeTvepPage } from './experiment-type-tvep.po';

describe('Experiment TVEP', () => {

  let app: ApplicationPage;
  let experiments: ExperimentsPage;
  let page: ExperimentTypeTvepPage;

  beforeEach(async () => {
    page = new ExperimentTypeTvepPage();
    experiments = new ExperimentsPage();
    app = new ApplicationPage();
    await browser.waitForAngularEnabled(false);
  });

  it('Should be able to create new experiment, check the list and delete the created experiment.', async () => {
    const experimentHelper: ExperimentTypeAbstractSpecHelper = new ExperimentTypeAbstractSpecHelper(app, experiments, page);
    await experimentHelper.testExperimentLivecycle(ExperimentType.TVEP, 'tvep-test');
  });

});
