import { FormBuilder } from '@angular/forms';
import { convertToParamMap } from '@angular/router';
import { NEVER, of } from 'rxjs';
import { AdminCategoryAddEditComponent } from './admin-category-add-edit.component';

describe('AdminCategoryAddEditComponent position', () => {
  let component: AdminCategoryAddEditComponent;
  let commonFacade: any;

  beforeEach(() => {
    commonFacade = {
      getCategorySuccess$: NEVER,
      createCategorySuccess$: NEVER,
      createCategoryError$: NEVER,
      updateCategoryError$: NEVER,
      updateCategorySuccess$: NEVER,
      deleteCategorySuccess$: NEVER,
      createCategory: jasmine.createSpy(),
      updateCategory: jasmine.createSpy(),
    };
    component = new AdminCategoryAddEditComponent(
      commonFacade,
      new FormBuilder(),
      {} as any,
      {} as any,
      { paramMap: of(convertToParamMap({})) } as any,
      {} as any,
    );

    component.ngOnInit();
    component.categoryForm.patchValue({
      name: 'Lato',
      url: 'lato',
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-08-31'),
    });
  });

  it('submits a new category without a position', () => {
    component.submitForm();

    expect(commonFacade.createCategory).toHaveBeenCalledWith({
      formData: {
        name: 'Lato',
        url: 'lato',
        startDate: new Date('2026-06-01'),
        endDate: new Date('2026-08-31'),
        isActive: false,
        isVisible: false,
      },
    });
  });

  it('submits null when an existing position is cleared', () => {
    component.mode = 'EDIT';
    component.editingCategory = { id: 'category-1' } as any;
    component.categoryForm.patchValue({ position: null });

    component.submitForm();

    expect(commonFacade.updateCategory).toHaveBeenCalledWith({
      id: 'category-1',
      formData: {
        name: 'Lato',
        url: 'lato',
        position: null,
        startDate: new Date('2026-06-01'),
        endDate: new Date('2026-08-31'),
        isActive: false,
        isVisible: false,
      },
    });
  });
});
