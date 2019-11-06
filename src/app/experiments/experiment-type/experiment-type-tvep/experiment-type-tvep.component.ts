import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

import { ToastrService } from 'ngx-toastr';
import { createEmptyExperiment, Experiment } from 'diplomka-share';

import { ExperimentsService } from '../../experiments.service';
import { BaseExperimentTypeComponent } from '../base-experiment-type.component';

@Component({
  selector: 'app-experiment-type-tvep',
  templateUrl: './experiment-type-tvep.component.html',
  styleUrls: ['./experiment-type-tvep.component.sass']
})
export class ExperimentTypeTvepComponent extends BaseExperimentTypeComponent<Experiment> implements OnInit {

  constructor(service: ExperimentsService,
              toastr: ToastrService,
              router: Router,
              route: ActivatedRoute,
              location: Location,
              cdr: ChangeDetectorRef) {
    super(service, toastr, router, route, location, cdr);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  protected _createEmptyExperiment(): Experiment {
    return createEmptyExperiment();
  }

}
