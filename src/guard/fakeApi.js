let DB = [
  {
    id: 1,
    student_name: "Rahul Sharma",
    room: "A-12",
    type: "Home",
    place: "Delhi",
    purpose: "Family Visit",
    departure: "2026-05-21T10:00",
    arrival: "2026-05-21T20:00",
    is_exited: false,
    is_returned: false,
  },
  {
    id: 2,
    student_name: "Aman Verma",
    room: "B-21",
    type: "Market",
    place: "-",
    purpose: "-",
    departure: "2026-05-22T17:00",
    arrival: "2026-05-22T19:00",
    is_exited: false,
    is_returned: false,
  },
];

const delay = (ms) => new Promise(r => setTimeout(r, ms));

export const fakeAPI = {
  async getAll() {
    await delay(200);
    return DB;
  },

  async exit(id) {
    await delay(200);
    DB = DB.map(o =>
      o.id === id ? { ...o, is_exited: true } : o
    );
    return DB;
  },

  async returnStudent(id) {
    await delay(200);
    DB = DB.map(o =>
      o.id === id ? { ...o, is_returned: true } : o
    );
    return DB;
  },

  async stats() {
    return {
      exits: DB.filter(x => x.is_exited).length,
      returns: DB.filter(x => x.is_returned).length,
    };
  },
};