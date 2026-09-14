import { NgModule } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzImageModule } from 'ng-zorro-antd/image';
import { NzInputModule } from 'ng-zorro-antd/input';

const ngZorroModules = [NzButtonModule, NzCardModule, NzFormModule, NzImageModule, NzInputModule];

@NgModule({
  imports: ngZorroModules,
  exports: ngZorroModules,
})
export class NgZorroExportsModule {}
