import { Component, ComponentFactoryResolver, OnInit, Type, ViewContainerRef } from '@angular/core';

import { of, Subscription } from 'rxjs';

import { Settings } from '../../settings/settings';
import { SettingsService } from '../../settings/settings.service';
import { DialogChildComponent } from '../modal/dialog-child.component';
import { ModalComponent } from '../modal/modal.component';
import { PageToolsChildComponent } from './page-tools-child-component';

@Component({
  selector: 'app-page-tools',
  templateUrl: './page-tools.component.html',
  styleUrls: ['./page-tools.component.sass']
})
export class PageToolsComponent extends DialogChildComponent implements OnInit {

  private _viewComponent: Type<any>;
  private _pageToolsChildComponent: PageToolsChildComponent;

  private _confirmSubscription: Subscription;
  private _showSubscription: Subscription;

  constructor(private readonly componentFactoryResolver: ComponentFactoryResolver,
              private readonly viewContainerRef: ViewContainerRef,
              private readonly _settings: SettingsService) {
    super();
  }

  private _preparePageToolsChildComponent(pageToolsChildComponentType: Type<any>) {
    // Podle zadané komponenty získám její továrnu
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(pageToolsChildComponentType);
    // Vymažu obsah ve view containeru
    this.viewContainerRef.clear();

    // Vytvořím novou komponentu ve viewContaineru za pomoci továrny
    const component = this.viewContainerRef.createComponent(componentFactory);

    this._pageToolsChildComponent = (component.instance as PageToolsChildComponent);
  }

  private _handleConfirm() {
    // Získám aktualizovanou část nastavení
    const settingsPart = this._pageToolsChildComponent.getUpdatedSettingsPart();
    // Zmerguju novou část s originálním nastavením
    this._settings.settings = Object.assign(this._settings.settings, settingsPart);
  }

  ngOnInit() {
      this._preparePageToolsChildComponent(this._viewComponent);
      const settings: Settings = this._settings.settings;
      this._pageToolsChildComponent.initSettings(settings);
  }

  bind(modal: ModalComponent) {
    modal.title = 'SHARE.PAGE_TOOLS.TITLE';
    modal.confirmText = 'SHARE.PAGE_TOOLS.CONFIRM';
    modal.cancelText = 'SHARE.PAGE_TOOLS.CANCEL';
    modal.confirmClose = false;
    modal.confirmDisabled = of(false);
    this._confirmSubscription = modal.confirm.subscribe(() => this._handleConfirm());
    this._showSubscription = modal.show.subscribe((args) => this._viewComponent = args[0]);
  }

  unbind(modal: ModalComponent) {
    this._confirmSubscription.unsubscribe();
    this._showSubscription.unsubscribe();
  }
}
