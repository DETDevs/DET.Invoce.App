import { useState, useMemo, useEffect, useCallback } from "react";
import type { CashMovement, MovementType, MovementTypeOption } from "@/features/cash-movements/types";
import type { DateRangeType } from "@/features/reports/types";
import cashRegisterApi from "@/api/cash-register/CashRegisterAPI";
import type { TCashMovement } from "@/api/cash-register/types";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useCashBox } from "@/features/settings/pages/CashBoxContext";
import toast from "react-hot-toast";

const SYSTEM_TYPE_IDS = [1];

function getDateRange(range: DateRangeType, customRange: { start: Date; end: Date } | null) {
    const now = new Date();
    let startDate = new Date();

    now.setHours(23, 59, 59, 999);

    switch (range) {
        case "today":
            startDate.setHours(0, 0, 0, 0);
            break;
        case "week":
            startDate.setDate(now.getDate() - 7);
            startDate.setHours(0, 0, 0, 0);
            break;
        case "month":
            startDate.setMonth(now.getMonth() - 1);
            startDate.setHours(0, 0, 0, 0);
            break;
        case "year":
            startDate.setFullYear(now.getFullYear() - 1);
            startDate.setHours(0, 0, 0, 0);
            break;
        case "custom":
            if (customRange) {
                startDate = customRange.start;
                now.setTime(customRange.end.getTime());
            }
            break;
    }

    return {
        dateFrom: startDate.toISOString(),
        dateTo: now.toISOString(),
    };
}

export const useCashMovements = () => {
    const [movements, setMovements] = useState<CashMovement[]>([]);
    const [movementTypes, setMovementTypes] = useState<MovementTypeOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState<MovementType | "all">("all");
    const [filterCategoryId, setFilterCategoryId] = useState<number | "all">("all");
    const [dateRange, setDateRange] = useState<DateRangeType>("today");
    const [customRange, setCustomRange] = useState<{ start: Date; end: Date } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const user = useAuthStore((s) => s.user);
    const { session } = useCashBox();

    const typesMap = useMemo(() => {
        const map = new Map<number, MovementTypeOption>();
        movementTypes.forEach((t) => map.set(t.cashMovementTypeId, t));
        return map;
    }, [movementTypes]);

    const mapApiMovement = useCallback(
        (m: TCashMovement): CashMovement => {
            const typeInfo = typesMap.get(m.cashMovementTypeId);
            return {
                id: String(m.cashMovementId),
                type: m.flow === "IN" ? "cash-in" : "cash-out",
                cashMovementTypeId: m.cashMovementTypeId,
                categoryName: typeInfo?.name ?? "Otro",
                amount: m.amount,
                description: m.description || "",
                createdBy: m.createdBy || "",
                createdAt: m.createdDate,
                notes: undefined,
            };
        },
        [typesMap]
    );

    const fetchTypes = useCallback(async () => {
        try {
            const data = await cashRegisterApi.getMovementType();
            if (Array.isArray(data)) {
                setMovementTypes(
                    data
                        .filter((t) => t.isActive)
                        .map((t) => ({
                            cashMovementTypeId: t.cashMovementTypeId,
                            name: t.name,
                            flow: t.flow as "IN" | "OUT",
                        }))
                );
            }
        } catch (err) {
            console.error("Error fetching movement types:", err);
        }
    }, []);

    const fetchMovements = useCallback(async () => {
        setLoading(true);
        try {
            const cashId = dateRange === "today" ? session?.cashRegisterId : undefined;
            const data = await cashRegisterApi.getMovement({ cashRegisterId: cashId });
            if (Array.isArray(data)) {
                const mapped = data
                    .filter((m) => !SYSTEM_TYPE_IDS.includes(m.cashMovementTypeId))
                    .map(mapApiMovement);
                mapped.sort(
                    (a, b) =>
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                setMovements(mapped);
            }
        } catch (err) {
            console.error("Error fetching cash movements:", err);
        } finally {
            setLoading(false);
        }
    }, [mapApiMovement, dateRange, session?.cashRegisterId]);

    useEffect(() => {
        fetchTypes();
    }, [fetchTypes]);

    useEffect(() => {
        if (movementTypes.length > 0) {
            fetchMovements();
        }
    }, [movementTypes, fetchMovements]);

    const selectableTypes = useMemo(() => {
        return movementTypes.filter(
            (t) => !SYSTEM_TYPE_IDS.includes(t.cashMovementTypeId)
        );
    }, [movementTypes]);

    const cashInTypes = useMemo(
        () => selectableTypes.filter((t) => t.flow === "IN"),
        [selectableTypes]
    );

    const cashOutTypes = useMemo(
        () => selectableTypes.filter((t) => t.flow === "OUT"),
        [selectableTypes]
    );

    const allDisplayTypes = useMemo(() => {
        return movementTypes.filter(
            (t) => !SYSTEM_TYPE_IDS.includes(t.cashMovementTypeId)
        );
    }, [movementTypes]);

    const addMovement = async (data: {
        cashMovementTypeId: number;
        amount: number;
        description: string;
    }) => {
        const typeInfo = typesMap.get(data.cashMovementTypeId);
        if (!typeInfo) {
            toast.error("Tipo de movimiento inválido");
            return;
        }

        try {
            await cashRegisterApi.saveMovement({
                cashMovementId: 0,
                cashRegisterId: 0,
                cashMovementTypeId: data.cashMovementTypeId,
                amount: data.amount,
                description: data.description,
                createdBy: user?.name ?? "Sistema",
                flow: typeInfo.flow,
                createdDate: new Date().toISOString(),
            });

            await fetchMovements();
            setCurrentPage(1);
        } catch (err) {
            console.error("Error saving cash movement:", err);
            toast.error("No se pudo registrar el movimiento");
            throw err;
        }
    };

    const filteredMovements = useMemo(() => {
        const { dateFrom, dateTo } = getDateRange(dateRange, customRange);
        const start = new Date(dateFrom);
        const end = new Date(dateTo);

        return movements.filter((movement) => {
            const matchesSearch = movement.description
                .toLowerCase()
                .includes(searchQuery.toLowerCase());

            const matchesType =
                filterType === "all" || movement.type === filterType;

            const matchesCategory =
                filterCategoryId === "all" ||
                movement.cashMovementTypeId === filterCategoryId;

            const md = new Date(movement.createdAt);
            const matchesDate = md >= start && md <= end;

            return matchesSearch && matchesType && matchesCategory && matchesDate;
        });
    }, [movements, searchQuery, filterType, filterCategoryId, dateRange, customRange]);

    const paginatedMovements = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredMovements.slice(startIndex, endIndex);
    }, [filteredMovements, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredMovements.length / itemsPerPage);

    const summary = useMemo(() => {
        const totalCashIn = filteredMovements
            .filter((m) => m.type === "cash-in")
            .reduce((sum, m) => sum + m.amount, 0);

        const totalCashOut = filteredMovements
            .filter((m) => m.type === "cash-out")
            .reduce((sum, m) => sum + m.amount, 0);

        return {
            totalCashIn,
            totalCashOut,
            balance: totalCashIn - totalCashOut,
            movementsCount: filteredMovements.length,
        };
    }, [filteredMovements]);

    const handleFilterChange = (
        type: "search" | "type" | "category",
        value: string | MovementType | number
    ) => {
        setCurrentPage(1);
        if (type === "search") setSearchQuery(value as string);
        else if (type === "type") setFilterType(value as MovementType | "all");
        else if (type === "category")
            setFilterCategoryId(value as number | "all");
    };

    return {
        movements: paginatedMovements,
        allMovements: movements,
        loading,
        filteredCount: filteredMovements.length,
        summary,
        searchQuery,
        setSearchQuery: (query: string) => handleFilterChange("search", query),
        filterType,
        setFilterType: (type: MovementType | "all") =>
            handleFilterChange("type", type),
        filterCategoryId,
        setFilterCategoryId: (id: number | "all") =>
            handleFilterChange("category", id),
        dateRange,
        setDateRange: (range: DateRangeType) => {
            setCurrentPage(1);
            setDateRange(range);
        },
        customRange,
        setCustomRange: (range: { start: Date; end: Date } | null) => {
            setCurrentPage(1);
            setCustomRange(range);
        },
        addMovement,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage,
        totalPages,
        refetch: fetchMovements,
        cashInTypes,
        cashOutTypes,
        allDisplayTypes,
    };
};
