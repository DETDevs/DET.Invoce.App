import { useState, useEffect } from "react";
import { Plus, Filter, Edit, Trash2, Search, Mail } from "lucide-react";
import { UserFilterPanel } from "@/features/users/compnents/UserFilterPanel";
import { EditUserModal } from "@/features/users/compnents/EditUserModal";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { useNavigate } from "react-router-dom";

const INITIAL_USERS = [
  {
    id: 1,
    name: "Carlos Martínez",
    email: "carlos@dulces.com",
    role: "Admin",
    status: "Activo",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=75",
  },
  {
    id: 2,
    name: "Ana López",
    email: "ana@dulces.com",
    role: "Vendedor",
    status: "Activo",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=75",
  },
  {
    id: 3,
    name: "Jorge Ruiz",
    email: "jorge@dulces.com",
    role: "Pastelero",
    status: "Inactivo",
    image:
      "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=80&q=75",
  },
];

export const UsersPage = () => {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [filteredUsers, setFilteredUsers] = useState(INITIAL_USERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ role: "", status: "" });

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    let result = users;

    if (searchTerm) {
      result = result.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (filters.role) {
      result = result.filter((user) => user.role === filters.role);
    }

    if (filters.status) {
      result = result.filter((user) => user.status === filters.status);
    }

    setFilteredUsers(result);
  }, [searchTerm, filters, users]);

  const handleEditClick = (user: any) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (user: any) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleSaveUser = (updatedUser: any) => {
    setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
  };

  const handleConfirmDelete = () => {
    setUsers(users.filter((u) => u.id !== selectedUser.id));
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="p-6 md:p-8 bg-[#FDFBF7] min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-[#2D2D2D]">Usuarios</h1>
        <button
          onClick={() => navigate("/nuevo-usuario")}
          className="flex items-center gap-2 bg-[#E8BC6E] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#dca34b] transition-colors shadow-sm w-full md:w-auto justify-center"
        >
          <Plus size={20} />
          Nuevo Usuario
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#E8BC6E] focus:border-[#E8BC6E] transition duration-150 ease-in-out"
            placeholder="Buscar por nombre o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative w-full md:w-auto">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 border rounded-xl font-medium transition-colors w-full md:w-auto ${
              isFilterOpen || filters.role || filters.status
                ? "border-[#E8BC6E] text-[#593D31] bg-[#F9F1D8]"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Filter size={18} />
            Filtrar
          </button>

          <UserFilterPanel
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            filters={filters}
            setFilters={setFilters}
            onApply={() => setIsFilterOpen(false)}
            onReset={() => setFilters({ role: "", status: "" })}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-[#FDFBF7]">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full overflow-hidden border border-gray-100">
                        <img
                          src={user.image}
                          alt={user.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-[#2D2D2D]">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#F3EFE0] text-[#593D31]">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === "Activo"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEditClick(user)}
                        className="p-2 text-[#E8BC6E] hover:bg-[#F9F1D8] rounded-lg transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(user)}
                        className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="p-4 border-b border-gray-100 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <img
                  src={user.image}
                  alt={user.name}
                  className="h-12 w-12 rounded-full object-cover border border-gray-100"
                  loading="lazy"
                />
                <div>
                  <h3 className="font-bold text-[#2D2D2D]">{user.name}</h3>
                  <div className="flex items-center text-xs text-gray-500 gap-1">
                    <Mail size={12} /> {user.email}
                  </div>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs bg-[#F3EFE0] text-[#593D31] px-2 py-0.5 rounded-full">
                      {user.role}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${user.status === "Activo" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
                    >
                      {user.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleEditClick(user)}
                  className="p-2 text-[#E8BC6E] bg-[#F9F1D8]/50 hover:bg-[#F9F1D8] rounded-lg"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDeleteClick(user)}
                  className="p-2 text-red-400 bg-red-50 hover:bg-red-100 rounded-lg"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={selectedUser}
        onSave={handleSaveUser}
      />

      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Usuario"
        message={`¿Estás seguro que deseas eliminar a "${selectedUser?.name}"?`}
        confirmText="Eliminar"
        variant="danger"
      />
    </div>
  );
};
