import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  catchError,
  forkJoin,
  map,
  Observable,
  of,
  shareReplay,
  switchMap
} from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Products } from '../../model/products/products.model';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  private readonly baseUrl = environment.baseUrl;

  private districtCache = new Map<number, Observable<any>>();
  private departmentCache = new Map<number, Observable<any>>();
  private countryCache = new Map<number, Observable<any>>();
  private categoryCache = new Map<string, Observable<any>>();

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Products[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/v2/products`).pipe(
      switchMap(products =>
        forkJoin(
          products.map(product => {
            const district$ =
              this.districtCache.get(product.districtId) ||
              this.http
                .get<any>(
                  `${this.baseUrl}/api/v2/districts/${product.districtId}`
                )
                .pipe(shareReplay(1));
            this.districtCache.set(product.districtId, district$);

            return district$.pipe(
              switchMap(district => {
                const department$ =
                  this.departmentCache.get(district.departmentId) ||
                  this.http
                    .get<any>(
                      `${this.baseUrl}/api/v2/departments/${district.departmentId}`
                    )
                    .pipe(shareReplay(1));
                this.departmentCache.set(district.departmentId, department$);

                return department$.pipe(
                  switchMap(department => {
                    const country$ =
                      this.countryCache.get(department.countryId) ||
                      this.http
                        .get<any>(
                          `${this.baseUrl}/api/v2/countries/${department.countryId}`
                        )
                        .pipe(shareReplay(1));
                    this.countryCache.set(department.countryId, country$);

                    return forkJoin({
                      product: of(product),
                      country: country$,
                      department: of(department),
                      district: of(district)
                    });
                  }),
                  map(details => this.transformProduct(details))
                );
              })
            );
          })
        )
      )
    );
  }

  postProduct(data: any): Observable<any> {
    const district = data.location.district;
    if (!district) throw new Error('District is null or undefined');

    return this.getDistrictId(district).pipe(
      switchMap(districtId =>
        this.http.post<any>(`${this.baseUrl}/api/v2/products`, {
          name: data.product_name,
          description: data.description,
          desiredObject: data.change_for,
          price: data.price,
          image: data.images[0],
          boost: data.boost,
          available: true,
          productCategoryId: data.category_id,
          userId: data.user_id,
          districtId
        })
      )
    );
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/api/v2/products/delete/${id}`);
  }

  putProduct(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/api/v2/products/edit/${id}`, {
      name: data.name,
      description: data.description,
      desiredObject: data.desiredObject,
      price: data.price,
      image: data.image,
      boost: data.boost,
      available: data.available,
      productCategoryId: data.productCategoryId,
      userId: data.userId,
      districtId: data.districtId
    });
  }

  getProductById(id: string): Observable<Products> {
    return this.http.get<any>(`${this.baseUrl}/api/v2/products/${id}`).pipe(
      switchMap(product => {
        const district$ =
          this.districtCache.get(product.districtId) ||
          this.http
            .get<any>(`${this.baseUrl}/api/v2/districts/${product.districtId}`)
            .pipe(shareReplay(1));
        this.districtCache.set(product.districtId, district$);

        return district$.pipe(
          switchMap(district => {
            const department$ =
              this.departmentCache.get(district.departmentId) ||
              this.http
                .get<any>(
                  `${this.baseUrl}/api/v2/departments/${district.departmentId}`
                )
                .pipe(shareReplay(1));
            this.departmentCache.set(district.departmentId, department$);

            return department$.pipe(
              switchMap(department => {
                const country$ =
                  this.countryCache.get(department.countryId) ||
                  this.http
                    .get<any>(
                      `${this.baseUrl}/api/v2/countries/${department.countryId}`
                    )
                    .pipe(shareReplay(1));
                this.countryCache.set(department.countryId, country$);

                return forkJoin({
                  product: of(product),
                  country: country$,
                  department: of(department),
                  district: of(district)
                });
              }),
              map(details => ({
                ...details.product,
                location: {
                  country: details.country.name,
                  department: details.department.name,
                  district: details.district.name
                }
              })),
              map(this.transformProduct2)
            );
          })
        );
      })
    );
  }

  getProductsByUserId(userId: number): Observable<Products[]> {
    return this.http
      .get<any[]>(`${this.baseUrl}/api/v2/products/user/${userId}`)
      .pipe(
        switchMap(products =>
          forkJoin(
            products.map(product => {
              const district$ =
                this.districtCache.get(product.districtId) ||
                this.http
                  .get<any>(
                    `${this.baseUrl}/api/v2/districts/${product.districtId}`
                  )
                  .pipe(shareReplay(1));
              this.districtCache.set(product.districtId, district$);

              return district$.pipe(
                switchMap(district => {
                  const department$ =
                    this.departmentCache.get(district.departmentId) ||
                    this.http
                      .get<any>(
                        `${this.baseUrl}/api/v2/departments/${district.departmentId}`
                      )
                      .pipe(shareReplay(1));
                  this.departmentCache.set(
                    district.departmentId,
                    department$
                  );

                  return department$.pipe(
                    switchMap(department => {
                      const country$ =
                        this.countryCache.get(department.countryId) ||
                        this.http
                          .get<any>(
                            `${this.baseUrl}/api/v2/countries/${department.countryId}`
                          )
                          .pipe(shareReplay(1));
                      this.countryCache.set(department.countryId, country$);

                      return forkJoin({
                        product: of(product),
                        country: country$,
                        department: of(department),
                        district: of(district)
                      });
                    }),
                    map(details => this.transformProduct(details))
                  );
                })
              );
            })
          )
        )
      );
  }

  getCategoriesProducts(): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.baseUrl}/api/v2/product-categories`)
      .pipe(
        map(categories =>
          categories
            ? categories.map(category => ({ ...category, name: category.name }))
            : []
        ),
        catchError(() => of([]))
      );
  }

  postCategoryProduct(data: any): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/api/v2/product-categories`,
      data
    );
  }

  deleteCategoryProduct(id: string): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}/api/v2/product-categories/${id}`
    );
  }

  putCategoryProduct(id: string, data: any): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/api/v2/product-categories/${id}`,
      data
    );
  }

  getCategoryProductById(id: string): Observable<any> {
    if (this.categoryCache.has(id)) return this.categoryCache.get(id)!;

    const request = this.http
      .get<any>(`${this.baseUrl}/api/v2/product-categories/${id}`)
      .pipe(shareReplay(1));

    this.categoryCache.set(id, request);
    return request;
  }

  private transformProduct(details: any): any {
    const product = details.product;
    return {
      id: product.id?.toString() ?? null,
      user_id: product.userId?.toString() ?? null,
      category_id: product.productCategoryId?.toString() ?? null,
      product_name: product.name,
      description: product.description,
      change_for: product.desiredObject,
      price: product.price,
      images: [product.image],
      boost: product.boost,
      available: product.available,
      location: {
        country: details.country?.name ?? null,
        department: details.department?.name ?? null,
        district: details.district?.name ?? null
      },
      category: product.productCategory?.name ?? null
    };
  }

  private transformProduct2(product: any): any {
    return {
      id: product.id?.toString() ?? null,
      user_id: product.userId?.toString() ?? null,
      category_id: product.productCategoryId?.toString() ?? null,
      product_name: product.name,
      description: product.description,
      change_for: product.desiredObject,
      price: product.price,
      images: [product.image],
      boost: product.boost,
      available: product.available,
      location: product.location,
      category: product.productCategory?.name ?? null
    };
  }

  getCountryById(id: number): Observable<any> {
    return id
      ? this.http.get<any>(`${this.baseUrl}/api/v2/countries/${id}`)
      : of(null);
  }

  getDepartmentById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/v2/departments/${id}`);
  }

  getDistrictById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/v2/districts/${id}`);
  }

  getDistrictId(districtName: string): Observable<number> {
    return this.http.get<any[]>(`${this.baseUrl}/api/v2/districts`).pipe(
      map(
        districts =>
          districts.find(d => d.name === districtName)?.id ?? -1
      ),
      catchError(() => of(-1))
    );
  }
}
