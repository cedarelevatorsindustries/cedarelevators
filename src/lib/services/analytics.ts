/**
 * Analytics Service for Dashboard
 */

export interface AnalyticsData {
    revenue: number
    orders: number
    customers: number
    averageOrderValue: number
}

export interface RevenueDataPoint {
    date: string
    revenue: number
}

export interface OrderDataPoint {
    date: string
    orders: number
}

export interface CategoryPerformance {
    name: string
    value: number
    percentage?: number
}

export interface TopProduct {
    id: string
    name: string
    sales: number
    revenue: number
}

export class AnalyticsService {
    static async getDashboardStats(): Promise<AnalyticsData> {
        return {
            revenue: 0,
            orders: 0,
            customers: 0,
            averageOrderValue: 0,
        }
    }

    static async getRevenueData(days: number = 30): Promise<RevenueDataPoint[]> {
        return []
    }

    static async getRevenueChart(period: string, days: number): Promise<RevenueDataPoint[]> {
        return this.getRevenueData(days)
    }

    static async getOrderData(days: number = 30): Promise<OrderDataPoint[]> {
        return []
    }

    static async getOrdersChart(days: number): Promise<OrderDataPoint[]> {
        return this.getOrderData(days)
    }

    static async getCategoryPerformance(): Promise<CategoryPerformance[]> {
        return []
    }

    static async getTopProducts(limit: number = 5): Promise<TopProduct[]> {
        return []
    }
}
