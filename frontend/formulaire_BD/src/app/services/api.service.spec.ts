import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService]
    });

    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should fetch test message from API', () => {
    const dummyResponse = { message: 'Bonjour depuis l\'API Node.js 🚀' };

    service.getTest().subscribe((res: any) => {
      expect(res.message).toBe(dummyResponse.message);
    });

    const req = httpMock.expectOne('http://localhost:3000/api/test');
    expect(req.request.method).toBe('GET');
    req.flush(dummyResponse);
  });

  afterEach(() => {
    httpMock.verify();
  });
});