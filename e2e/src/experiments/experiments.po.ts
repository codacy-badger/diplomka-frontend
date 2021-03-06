import { browser, by, element, ElementFinder, protractor } from 'protractor';

import { ExperimentType } from '@stechy1/diplomka-share';

import { Page } from '../page';

export class ExperimentsPage implements Page {
  navigateTo(): Promise<any> {
    return browser.get('/experiments') as Promise<any>;
  }

  get experimentsEmptyHeader(): ElementFinder {
    return element(by.id('experiments-not-found'));
  }

  get experimentNewButton(): ElementFinder {
    return element(by.className('fab-toggler'));
  }

  get experimentTypeList(): ElementFinder {
    return element(by.className('fab-button-list'));
  }

  get availableExperimentList(): ElementFinder {
    return element(by.className('experiment-list'));
  }

  get addonButtonExperimentsFinder(): ElementFinder {
    return element(by.id('button-addon-experiments-finder'));
  }

  get addonButtonExperimentsFilter(): ElementFinder {
    return element(by.id('button-addon-experiments-filter'));
  }

  async clickToNewExperiment(experimentType: ExperimentType) {
    // Zobrazení nabídky s tlačítky pro jednotlivé experimenty
    await this.experimentNewButton.click();
    // Zvolení vybraného tlačítka
    await this.experimentTypeList.element(by.buttonText(ExperimentType[experimentType])).click();
  }

  async deleteAllExperiments(): Promise<any> {
    const trashButtons = await this.availableExperimentList.all(by.css('.fa-trash.delete'));
    for (const trashButton of trashButtons) {
      await trashButton.click();
      const confirmButton = element(by.buttonText('Potvrzuji'));
      await browser.wait(protractor.ExpectedConditions.visibilityOf(confirmButton), 5000);
      await confirmButton.click();
    }
  }
}
