import { useState, useMemo, useEffect, useCallback } from "react";
import type { CashMovement, MovementType, MovementTypeOption } from "@/features/cash-movements/types";
import cashRegisterApi from "@/api/cash-register/CashRegisterAPI";
import type { TCashMovement } from "@/api/cash-register/types";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import toast from "react-hot-toast";

const SYSTEM_TYPE_IDS = [1];

export const useCashMovements = () => {
    const [movements, setMovements] = useState<CashMovement[]>([]);
    const [movementTypes, setMovementTypes] = useState<MovementTypeOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState<MovementType | "all">("all");
    const [filterCategoryId, setFilterCategoryId] = useState<number | "all">("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const user = useAuthStore((s) => s.user);

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
            const data = await cashRegisterApi.getMovement({});
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
    }, [mapApiMovement]);

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
        return movements.filter((movement) => {
            const matchesSearch = movement.description
                .toLowerCase()
                .includes(searchQuery.toLowerCase());

            const matchesType =
                filterType === "all" || movement.type === filterType;

            const matchesCategory =
                filterCategoryId === "all" ||
                movement.cashMovementTypeId === filterCategoryId;

            return matchesSearch && matchesType && matchesCategory;
        });
    }, [movements, searchQuery, filterType, filterCategoryId]);

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
