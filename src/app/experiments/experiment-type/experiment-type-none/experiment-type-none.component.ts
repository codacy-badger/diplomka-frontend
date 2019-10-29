import { Component, OnInit } from '@angular/core';
import { BaseExperimentTypeComponent } from '../base-experiment-type.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-experiment-type-none',
  templateUrl: './experiment-type-none.component.html',
  styleUrls: ['./experiment-type-none.component.sass']
})
export class ExperimentTypeNoneComponent extends BaseExperimentTypeComponent implements OnInit {

  constructor(route: ActivatedRoute) {
    super(route);
  }

  ngOnInit() {
    super.ngOnInit();
  }

}
