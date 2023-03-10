import { TestBed } from '@angular/core/testing';

import { LaunchpadService } from './launchpad.service';

describe('LaunchpadService', () => {
  let service: LaunchpadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LaunchpadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
