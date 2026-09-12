import { BehaviorSubject } from 'rxjs';

export class RowSelection {
  private readonly selectedIdsSubject: BehaviorSubject<Set<string>> = new BehaviorSubject<Set<string>>(new Set());

  public readonly selectedIds$ = this.selectedIdsSubject.asObservable();

  public toggle(id: string): void {
    const selectedIds = new Set(this.selectedIdsSubject.value);

    if (selectedIds.has(id)) {
      selectedIds.delete(id);
    } else {
      selectedIds.add(id);
    }

    this.selectedIdsSubject.next(selectedIds);
  }

  public selectMany(ids: string[]): void {
    const selectedIds = new Set(this.selectedIdsSubject.value);

    ids.forEach((id) => selectedIds.add(id));

    this.selectedIdsSubject.next(selectedIds);
  }

  public deselectMany(ids: string[]): void {
    const selectedIds = new Set(this.selectedIdsSubject.value);

    ids.forEach((id) => selectedIds.delete(id));

    this.selectedIdsSubject.next(selectedIds);
  }

  public clear(): void {
    this.selectedIdsSubject.next(new Set());
  }
}
