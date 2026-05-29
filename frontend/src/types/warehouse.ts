export interface Warehouse {
  id: string;
  userId: string;
  name: string;
  address?: string | null;
  city?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
