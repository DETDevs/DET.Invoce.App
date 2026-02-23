export type TDashboardMoney = {
    totalMoneyToday_: number;
};

export type TDashboardProductsSold = {
    totalProductsSoldToday_: number;
};

export type TSalesByCategory = {
    categoryId: number;
    categoryName: string;
    totalProductsSold: number;
    totalMoney: number;
};

export type TTopProductByCategory = {
    categoryName: string;
    productName: string;
    totalSold: number;
    imageUrl?: string;
};
