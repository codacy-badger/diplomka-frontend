import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

import { ExperimentsButtonsAddonService } from './experiments-buttons-addon.service';

@Component({
  selector: 'app-experiments-buttons-addon',
  templateUrl: './experiments-buttons-addon.component.html',
  styleUrls: ['./experiments-buttons-addon.component.sass']
})
export class ExperimentsButtonsAddonComponent implements OnInit {

  hideFinderBox = true;
  initialSearchValue: string;

  constructor(private readonly _service: ExperimentsButtonsAddonService,
              private readonly _location: Location,
              private readonly _route: ActivatedRoute,
              private readonly _router: Router) { }

  private _notifySearchValue(value: string) {
    this._service.searchValue.next(value);
  }

  ngOnInit() {
    this._route.fragment.subscribe(value => {
      this.initialSearchValue = value || '';
      this._notifySearchValue(this.initialSearchValue);
    });
  }

  handleShowFilter() {
    this._service.filterRequest.next();
  }

  handleSearchInputChange(event: Event) {
    const value: string = (event.target as HTMLInputElement).value;
    const url = this._router.serializeUrl(this._router.createUrlTree([], {relativeTo: this._route, fragment: value}));
    this._location.go(url);
    this._notifySearchValue(value || '');
  }
}
