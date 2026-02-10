import { useState, useMemo } from "react";
import type { CashMovement, MovementType, MovementCategory } from "@/features/cash-movements/types";

const generateMockMovements = (): CashMovement[] => {
    const movements: CashMovement[] = [
        {
            id: "CM-001",
            type: "cash-in",
            category: "fondo_caja",
            amount: 500,
            description: "Aporte para fondo de caja del día",
            createdBy: "María González",
            createdAt: new Date().toISOString(),
            notes: "Billetes de C$20 y C$50 para dar cambio",
        },
        {
            id: "CM-002",
            type: "cash-out",
            category: "proveedor",
            amount: 1200,
            description: "Pago a proveedor de harina",
            createdBy: "Ana López",
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            notes: "Factura #4521",
        },
        {
            id: "CM-003",
            type: "cash-in",
            category: "aporte",
            amount: 2000,
            description: "Aporte de capital",
            createdBy: "Carlos Martínez",
            createdAt: new Date(Date.now() - 7200000).toISOString(),
        },
        {
            id: "CM-004",
            type: "cash-out",
            category: "gasto",
            amount: 350,
            description: "Compra de gas para cocina",
            createdBy: "María González",
            createdAt: new Date(Date.now() - 10800000).toISOString(),
        },
        {
            id: "CM-005",
            type: "cash-in",
            category: "fondo_caja",
            amount: 800,
            description: "Refuerzo de efectivo para cambio",
            createdBy: "Ana López",
            createdAt: new Date(Date.now() - 14400000).toISOString(),
            notes: "Billetes de C$10 y C$20",
        },
        {
            id: "CM-006",
            type: "cash-out",
            category: "proveedor",
            amount: 950,
            description: "Pago a proveedor de azúcar",
            createdBy: "Carlos Martínez",
            createdAt: new Date(Date.now() - 18000000).toISOString(),
        },
        {
            id: "CM-007",
            type: "cash-out",
            category: "retiro",
            amount: 1500,
            description: "Retiro del dueño",
            createdBy: "María González",
            createdAt: new Date(Date.now() - 21600000).toISOString(),
        },
        {
            id: "CM-008",
            type: "cash-in",
            category: "devolucion",
            amount: 200,
            description: "Devolución de cliente",
            createdBy: "Ana López",
            createdAt: new Date(Date.now() - 25200000).toISOString(),
            notes: "Pedido cancelado #1234",
        },
        {
            id: "CM-009",
            type: "cash-out",
            category: "gasto",
            amount: 180,
            description: "Pago de servicio de agua",
            createdBy: "Carlos Martínez",
            createdAt: new Date(Date.now() - 28800000).toISOString(),
        },
        {
            id: "CM-010",
            type: "cash-in",
            category: "fondo_caja",
            amount: 600,
            description: "Aporte para fondo de caja semanal",
            createdBy: "María González",
            createdAt: new Date(Date.now() - 32400000).toISOString(),
        },
        {
            id: "CM-011",
            type: "cash-out",
            category: "proveedor",
            amount: 2100,
            description: "Pago a proveedor de mantequilla",
            createdBy: "Ana López",
            createdAt: new Date(Date.now() - 36000000).toISOString(),
            notes: "Factura #4522",
        },
        {
            id: "CM-012",
            type: "cash-in",
            category: "aporte",
            amount: 3000,
            description: "Aporte de capital mensual",
            createdBy: "Carlos Martínez",
            createdAt: new Date(Date.now() - 39600000).toISOString(),
        },
    ];
    return movements;
};

const MOCK_MOVEMENTS = generateMockMovements();

export const useCashMovements = () => {
    const [movements, setMovements] = useState<CashMovement[]>(MOCK_MOVEMENTS);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState<MovementType | "all">("all");
    const [filterCategory, setFilterCategory] = useState<MovementCategory | "all">("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const addMovement = (movement: Omit<CashMovement, "id" | "createdAt" | "createdBy">) => {
        const newMovement: CashMovement = {
            ...movement,
            id: `CM-${String(movements.length + 1).padStart(3, "0")}`,
            createdAt: new Date().toISOString(),
            createdBy: "Usuario Actual", // TODO: Obtener del contexto de autenticación
        };

        setMovements((prev) => [newMovement, ...prev]);
        setCurrentPage(1);
    };

    const filteredMovements = useMemo(() => {
        return movements.filter((movement) => {
            const matchesSearch =
                movement.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                movement.notes?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesType = filterType === "all" || movement.type === filterType;
            const matchesCategory = filterCategory === "all" || movement.category === filterCategory;

            return matchesSearch && matchesType && matchesCategory;
        });
    }, [movements, searchQuery, filterType, filterCategory]);

    const paginatedMovements = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredMovements.slice(startIndex, endIndex);
    }, [filteredMovements, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredMovements.length / itemsPerPage);

    const summary = useMemo(() => {
        const totalCashIn = movements
            .filter((m) => m.type === "cash-in")
            .reduce((sum, m) => sum + m.amount, 0);

        const totalCashOut = movements
            .filter((m) => m.type === "cash-out")
            .reduce((sum, m) => sum + m.amount, 0);

        return {
            totalCashIn,
            totalCashOut,
            balance: totalCashIn - totalCashOut,
            movementsCount: movements.length,
        };
    }, [movements]);

    const handleFilterChange = (
        type: "search" | "type" | "category",
        value: string | MovementType | MovementCategory
    ) => {
        setCurrentPage(1);
        if (type === "search") setSearchQuery(value as string);
        else if (type === "type") setFilterType(value as MovementType | "all");
        else if (type === "category") setFilterCategory(value as MovementCategory | "all");
    };

    return {
        movements: paginatedMovements,
        allMovements: movements,
        filteredCount: filteredMovements.length,
        summary,
        searchQuery,
        setSearchQuery: (query: string) => handleFilterChange("search", query),
        filterType,
        setFilterType: (type: MovementType | "all") => handleFilterChange("type", type),
        filterCategory,
        setFilterCategory: (category: MovementCategory | "all") => handleFilterChange("category", category),
        addMovement,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage,
        totalPages,
    };
};
