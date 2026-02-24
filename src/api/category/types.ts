export type TSubCategory = {
    subCategoryId: number;
    categoryCode: string;
    name: string;
    isActive: boolean;
    categoryName: string | null;
};

export type TCategory = {
    categoryId: number;
    categoryCode: string;
    categoryName: string;
    description: string | null;
    isActive: boolean;
    subCategories: TSubCategory[];
};
