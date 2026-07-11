import { Injectable, LoggerService, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger implements LoggerService {
  private context = 'System';

  setContext(context: string) {
    this.context = context;
  }

  log(message: any, ...optionalParams: any[]) {
    this.printMessage('INFO', message, optionalParams);
  }

  error(message: any, ...optionalParams: any[]) {
    this.printMessage('ERROR', message, optionalParams);
  }

  warn(message: any, ...optionalParams: any[]) {
    this.printMessage('WARN', message, optionalParams);
  }

  debug?(message: any, ...optionalParams: any[]) {
    this.printMessage('DEBUG', message, optionalParams);
  }

  verbose?(message: any, ...optionalParams: any[]) {
    this.printMessage('VERBOSE', message, optionalParams);
  }

  private printMessage(level: string, message: any, optionalParams: any[]) {
    const timestamp = new Date().toISOString();
    const cleanContext = optionalParams.length > 0 && typeof optionalParams[optionalParams.length - 1] === 'string'
      ? optionalParams.pop()
      : this.context;
    
    const formattedParams = optionalParams.length > 0 ? ` | Params: ${JSON.stringify(optionalParams)}` : '';
    console.log(`[${timestamp}] [${level}] [${cleanContext}] ${message}${formattedParams}`);
  }
}
