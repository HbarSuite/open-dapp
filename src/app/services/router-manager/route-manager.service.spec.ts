import { TestBed } from '@angular/core/testing';

import { RouteManagerService } from './route-manager.service';

describe('RouteManagerService', () => {
  let service: RouteManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RouteManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
