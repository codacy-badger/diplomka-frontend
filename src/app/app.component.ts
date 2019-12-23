import { Component } from '@angular/core';

import { NavigationService } from './navigation/navigation.service';
import { SerialService } from './share/serial.service';
import { SequenceService } from './share/sequence.service';
import { ConsoleService } from './settings/console/console.service';
import { NGXLogger } from 'ngx-logger';
import { ConsoleLoggerMonitorService } from './console-logger-monitor.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {

  constructor(public readonly navigation: NavigationService,
              private readonly serial: SerialService,
              private readonly sequence: SequenceService,
              private readonly console: ConsoleService,
              private readonly logger: NGXLogger) {
    logger.registerMonitor(new ConsoleLoggerMonitorService(console));

  }
}
