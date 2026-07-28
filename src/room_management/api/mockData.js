// src/room_management/api/mockData.js

export const mockRooms = [
  {
    id: "r1",
    roomNumber: "101",
    hostelId: "Hostel A",
    capacity: 2,
    status: "STUDENT", // Can be STUDENT, GUEST, STAFF, MAINTENANCE
    residents: [
      { id: "s1", name: "Aarav Kumar", rollNo: "BT001", branch: "CSE" },
      { id: "s2", name: "Bhavna Singh", rollNo: "BT002", branch: "CSE" }
    ]
  },
  {
    id: "r2",
    roomNumber: "102",
    hostelId: "Hostel A",
    capacity: 2,
    status: "STUDENT",
    residents: [
      { id: "s3", name: "Chirag Patel", rollNo: "BT003", branch: "ECE" }
      // 1 bed is empty here
    ]
  },
  {
    id: "r3",
    roomNumber: "103",
    hostelId: "Hostel A",
    capacity: 2,
    status: "GUEST", // Reserved for guests
    residents: []
  },
  {
    id: "r4",
    roomNumber: "201",
    hostelId: "Hostel B", // Different hostel
    capacity: 3,
    status: "MAINTENANCE", // Under repair
    residents: []
  }
];