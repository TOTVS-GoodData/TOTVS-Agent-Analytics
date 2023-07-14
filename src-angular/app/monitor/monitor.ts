import { MonitorMessage } from './monitor.message';

export class Monitor {
    idExecution: string;
    typeExecution: string;
    project: string;
    start: string;
    finish: string;
    duration: string;
    logExecution: string;
    status: string;
    serverLocal: Array<MonitorMessage>;
    serverGoodData: Array<MonitorMessage>;
    action: string[];

    constructor() {
        this.action = [];
    }
}
