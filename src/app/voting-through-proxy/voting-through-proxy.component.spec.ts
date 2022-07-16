import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VotingThroughProxyComponent } from './voting-through-proxy.component';

describe('VotingThroughProxyComponent', () => {
  let component: VotingThroughProxyComponent;
  let fixture: ComponentFixture<VotingThroughProxyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VotingThroughProxyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VotingThroughProxyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
