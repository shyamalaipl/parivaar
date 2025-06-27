import { useState } from "react";
import { CircleChevronLeft, Plus } from "lucide-react";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";

const Adduser = ({ setActivePage }) => {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "John Doe",
      number: "1234567890",
      email: "john@example.com",
      selected: false,
    },
    {
      id: 2,
      name: "Jane Smith",
      number: "0987654321",
      email: "jane@example.com",
      selected: false,
    },
  ]);

  const handleExcelUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        const mappedData = jsonData.map((row, index) => ({
          id: users.length + index + 1,
          name: row.Name || "Unknown",
          number: row.Number || "N/A",
          email: row.Email || "N/A",
          selected: false,
        }));

        setUsers([...users, ...mappedData]);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleSendInvite = (user) => {
    Swal.fire({
      icon: "success",
      title: "Success",
      text: `Invite successfully sent to ${user.email}`,
      timer: 2000,
      showConfirmButton: false,
    });
  };

  const handleSelectAll = () => {
    const allSelected = users.every((user) => user.selected);
    setUsers(users.map((user) => ({ ...user, selected: !allSelected })));
  };

  const handleSelectUser = (id) => {
    setUsers(
      users.map((user) =>
        user.id == id ? { ...user, selected: !user.selected } : user
      )
    );
  };

  const handleBulkInvite = () => {
    const selectedUsers = users.filter((user) => user.selected);
    if (selectedUsers.length == 0) {
      Swal.fire({
        icon: "warning",
        title: "No Selection",
        text: "Please select at least one user to send invites",
      });
      return;
    }

    Swal.fire({
      icon: "success",
      title: "Success",
      text: `Invites successfully sent to ${selectedUsers.length} users`,
      timer: 2000,
      showConfirmButton: false,
    });
  };

  return (
    <div>
      {/* Header */}
      <header className="bg-[#1A2B49] rounded-xl p-4 flex items-center justify-between shadow-xl sticky top-0 z-10">
        <button
          className="flex cursor-pointer items-center text-white"
          onClick={() => setActivePage("dashboardmember")}
        >
          <CircleChevronLeft size={30} className="mr-2" />
        </button>
        <h1 className="text-2xl font-bold text-white">Invite Member</h1>
        <label className="bg-white rounded-xl text-[#1A2B49] py-2 px-6  text-sm font-semibold flex items-center hover:bg-gray-100 transition-colors shadow-md cursor-pointer">
          <Plus size={20} className="mr-2" />
          Upload Excel
          <input
            type="file"
            accept=".xlsx, .xls"
            className="hidden"
            onChange={handleExcelUpload}
          />
        </label>
      </header>

      {/* User Table */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">User List</h2>
          <button
            className="bg-white text-[#1A2B49] py-2 px-4 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors shadow-md"
            onClick={handleBulkInvite}
          >
            Send Selected Invites
          </button>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#1A2B49] text-white">
              <th className="p-3 text-left">
                <input
                  type="checkbox"
                  checked={users.every((user) => user.selected)}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Number</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={user.selected}
                    onChange={() => handleSelectUser(user.id)}
                  />
                </td>
                <td className="p-3">{user.name}</td>
                <td className="p-3">{user.number}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">
                  <button
                    className="bg-white text-[#1A2B49] py-1 px-3 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors shadow-md"
                    onClick={() => handleSendInvite(user)}
                  >
                    Send Invite
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Adduser;
