import { TestBed } from '@angular/core/testing';

import { SmartService } from './smart.service';

describe('SmartService', () => {
  let service: SmartService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SmartService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
