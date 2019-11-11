import { AfterViewInit, ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Location } from '@angular/common';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';

import { ExperimentsService } from '../experiments.service';
import { Experiment, ExperimentType } from 'diplomka-share';
import { ToastrService } from 'ngx-toastr';
import { Subscription, TimeoutError } from 'rxjs';

export abstract class BaseExperimentTypeComponent<E extends Experiment> implements OnInit, AfterViewInit, OnDestroy {

  protected _experiment: E;
  public form: FormGroup;
  private _connectedSubscription: Subscription;
  private _workingSubscription: Subscription;
  private _isNew = true;

  protected constructor(protected readonly _service: ExperimentsService,
                        protected readonly toastr: ToastrService,
                        protected readonly _router: Router,
                        protected readonly _route: ActivatedRoute,
                        protected readonly _location: Location,
                        protected readonly _cdr: ChangeDetectorRef) {
    this.form = new FormGroup(this._createFormControls());
  }

  /**
   * Obslužná metoda načtení experimentu podle ID
   *
   * @param experimentId ID experimentu
   */
  private _loadExperiment(experimentId: string) {
    this._experiment = this._createEmptyExperiment();

    if (experimentId !== undefined) {
      if (isNaN(parseInt(experimentId, 10))) {
        this.toastr.error(`ID experimentu: '${experimentId}' se nepodařilo naparsovat!`);
        this._router.navigate(['/experiments']);
        return;
      }

      this._isNew = false;
      this._experiment.id = +experimentId;
    }
    this._updateFormGroup(this._experiment);

    if (experimentId !== undefined) {
      this._service.one(+experimentId)
          .catch(error => {
            // Pokud nenastane timeout => experiment nebyl na serveru nalezen
            if (!(error instanceof TimeoutError)) {
              // Rovnou přesmeruji na seznam všech experimentů
              this._router.navigate(['/experiments']);
            }

            // Nastal timeout
            // vrátím existující prázdný experiment a přihlásím se k socketu na událost
            // pro obnovení spojení
            this._connectedSubscription = this._service.connected$.subscribe(() => {
              this._connectedSubscription.unsubscribe();
              this._loadExperiment(experimentId);
            });
            return this._experiment;
          })
          .then((experiment: E) => {
            this._experiment = experiment;
            this._updateFormGroup(this._experiment);
          });
    }
  }

  /**
   * Pomocná privátní metoda pro aktualizaci formuláře
   *
   * @param experiment Experiment, který dodá data do formuláře
   */
  protected _updateFormGroup(experiment: E) {
    this.form.patchValue(experiment);
  }

  /**
   * Pomocná abstraktní metoda pro vytvoření prázdné instance experimentu
   */
  protected abstract _createEmptyExperiment(): E;

  /**
   * Pomocná abstraktní metoda pro vytvoření formulářové skupiny komponent
   */
  protected _createFormControls(): { [p: string]: AbstractControl } {
    return {
      id: new FormControl(),
      name: new FormControl(null, [Validators.required]),
      description: new FormControl(),
      type: new FormControl(),
      created: new FormControl(),
      output: new FormGroup({
        led: new FormControl(),
        image: new FormControl(),
        sound: new FormControl()
      })
    };
  }

  ngOnInit(): void {
    this._route.params.subscribe((params: Params) => {
      this._loadExperiment(params['id']);
    });

    this._workingSubscription = this.working.subscribe(working => {
      if (working) {
        this.form.disable();
      } else {
        this.form.enable();
      }
    });
  }

  ngAfterViewInit(): void {
    this._cdr.detectChanges();
  }

  ngOnDestroy(): void {
    if (this._connectedSubscription) {
      this._connectedSubscription.unsubscribe();
    }
    this._workingSubscription.unsubscribe();
  }

  /**
   * Reakce na tlačítko pro uložení dat experimentu
   */
  public handleSaveExperiment() {
    if (this._experiment.id === undefined) {
      this._service.insert(this.form.value)
          .then((experiment: E) => {
            this._experiment = experiment;
            // Po úspěšném založení nového experimentu,
            // upravím adresní řádek tak, aby obsahoval ID experimentu
            this._router.navigate(['/', 'experiments', ExperimentType[experiment.type].toLowerCase(), experiment.id]);
          });
    } else {
      this._service.update(this.form.value);
    }
  }

  public get experiment(): E {
    return this._experiment;
  }

  get working() {
    return this._service.working$;
  }

  get isNew() {
    return this._isNew;
  }
}
