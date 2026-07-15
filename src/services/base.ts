export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class BaseService<T extends { id: string }> {
  constructor(
    protected getList: () => T[],
    protected setList?: (items: T[]) => void,
    protected onUpdate?: (id: string, item: T) => void,
    protected onCreate?: (item: T) => void,
    protected onDelete?: (id: string) => void
  ) {}

  async getAll(): Promise<T[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...this.getList()]), 150);
    });
  }

  async getById(id: string): Promise<T | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const item = this.getList().find((i) => i.id === id) || null;
        resolve(item);
      }, 100);
    });
  }

  async create(data: Omit<T, "id"> & { id?: string }): Promise<T> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newItem = {
          ...data,
          id: data.id || `gen-${Date.now()}`
        } as T;
        
        if (this.onCreate) {
          this.onCreate(newItem);
        } else if (this.setList) {
          this.setList([...this.getList(), newItem]);
        }
        
        resolve(newItem);
      }, 200);
    });
  }

  async update(id: string, updates: Partial<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const list = this.getList();
        const index = list.findIndex((i) => i.id === id);
        if (index === -1) {
          reject(new Error(`Entity with ID ${id} not found`));
          return;
        }
        const updatedItem = { ...list[index], ...updates };
        
        if (this.onUpdate) {
          this.onUpdate(id, updatedItem);
        } else if (this.setList) {
          const newList = [...list];
          newList[index] = updatedItem;
          this.setList(newList);
        }
        
        resolve(updatedItem);
      }, 150);
    });
  }

  async delete(id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const list = this.getList();
        const exists = list.some((i) => i.id === id);
        if (!exists) {
          reject(new Error(`Entity with ID ${id} not found`));
          return;
        }
        
        if (this.onDelete) {
          this.onDelete(id);
        } else if (this.setList) {
          this.setList(list.filter((i) => i.id !== id));
        }
        
        resolve(true);
      }, 150);
    });
  }

  async search(query: string, fields: (keyof T)[]): Promise<T[]> {
    const list = await this.getAll();
    if (!query) return list;
    const lowerQuery = query.toLowerCase();
    return list.filter((item) =>
      fields.some((field) => {
        const value = item[field];
        if (value === undefined || value === null) return false;
        return String(value).toLowerCase().includes(lowerQuery);
      })
    );
  }

  async filter(predicate: (item: T) => boolean): Promise<T[]> {
    const list = await this.getAll();
    return list.filter(predicate);
  }

  async paginate(
    list: T[],
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResult<T>> {
    const total = list.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const data = list.slice(start, start + pageSize);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages
    };
  }
}
