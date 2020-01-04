import { AfterViewInit, ChangeDetectorRef, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';

import { Observable, Subscription, TimeoutError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { NGXLogger } from 'ngx-logger';

import { Experiment, ExperimentType } from '@stechy1/diplomka-share';

import { NavigationService } from '../../navigation/navigation.service';
import { ExperimentsService } from '../experiments.service';

export abstract class BaseExperimentTypeComponent<E extends Experiment> implements OnInit, AfterViewInit, OnDestroy {

  protected _experiment: E;
  private _experimentLoaded: EventEmitter<E> = new EventEmitter<E>();
  protected _experimentLoaded$: Observable<E> = this._experimentLoaded.asObservable();
  public form: FormGroup;
  private _connectedSubscription: Subscription;
  private _workingSubscription: Subscription;
  private _isNew = true;

  protected constructor(protected readonly _service: ExperimentsService,
                        protected readonly toastr: ToastrService,
                        protected readonly _router: Router,
                        protected readonly _route: ActivatedRoute,
                        protected readonly _navigation: NavigationService,
                        protected readonly _cdr: ChangeDetectorRef,
                        protected readonly logger: NGXLogger) {
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
        this.logger.error(`ID experimentu: '${experimentId}' se nepodařilo naparsovat!`);
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
            this.logger.info(`Budu zobrazovat konfiguraci experimentu s ID: ${experiment.id}.`);
            this._experiment = experiment;
            this._updateFormGroup(this._experiment);
            this._navigation.customNavColor.next(ExperimentType[experiment.type].toLowerCase());
            this._experimentLoaded.next(experiment);
          });
    }
  }

  /**
   * Pomocná privátní metoda pro aktualizaci formuláře
   *
   * @param experiment Experiment, který dodá data do formuláře
   */
  protected _updateFormGroup(experiment: E) {
    this.logger.debug('Aktualizuji hodnoty ve formuláři.');
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
    this.logger.debug('Vytvářím kontrolky pro formulář.');
    return {
      id: new FormControl(null),
      name: new FormControl(null, [Validators.required]),
      description: new FormControl(),
      type: new FormControl(null, [Validators.required]),
      created: new FormControl(null)
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
            this.logger.info(`Zakládám nový experiment s id: ${experiment.id}`);
            this._experiment = experiment;
            // Po úspěšném založení nového experimentu,
            // upravím adresní řádek tak, aby obsahoval ID experimentu
            this._router.navigate(['/', 'experiments', ExperimentType[experiment.type].toLowerCase(), experiment.id], {replaceUrl: true });
          });
    } else {
      this.logger.info(`Aktualizuji experiment s id: ${this._experiment.id}`);
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

  get experimentLoaded$(): Observable<E> {
    return this._experimentLoaded$;
  }
}
