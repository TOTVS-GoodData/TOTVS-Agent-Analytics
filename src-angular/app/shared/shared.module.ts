import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Util } from './util';

@NgModule({
    declarations: [
    ],
    imports: [
        CommonModule,
    ],
    providers: [ Util ]
})
export class SharedModule {}
