import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

// Seed Initial LocalStorage DBs if not present
const initializeLocalStorage = () => {
  if (typeof window === "undefined") return;

  const defaultEmployees = [
    {
      _id: "emp_1",
      id: "1",
      employeeId: "EMP-001",
      firstName: "John",
      lastName: "Doe",
      department: "Engineering",
      designation: "Sr. Developer",
      joiningDate: "2023-01-15",
      phone: "+1 (555) 000-1111",
      email: "j.doe@company.com",
      gender: "Male",
      address: "123 Tech Lane, Silicon Valley",
      basicSalary: 8000,
      bonus: 500,
      allowance: 300,
      user: {
        _id: "usr_1",
        employeeId: "EMP-001",
        name: "John Doe",
        email: "j.doe@company.com",
        role: "Employee",
        isActive: true,
      },
    },
    {
      _id: "emp_2",
      id: "2",
      employeeId: "MGR-001",
      firstName: "Jane",
      lastName: "Smith",
      department: "HR",
      designation: "HR Manager",
      joiningDate: "2022-06-20",
      phone: "+1 (555) 000-2222",
      email: "j.smith@company.com",
      gender: "Female",
      address: "456 People Blvd, New York",
      basicSalary: 9500,
      bonus: 1000,
      allowance: 500,
      user: {
        _id: "usr_2",
        employeeId: "MGR-001",
        name: "Jane Smith",
        email: "j.smith@company.com",
        role: "Manager",
        isActive: true,
      },
    },
  ];

  const defaultLeaves = [
    {
      _id: "leave_1",
      employee: {
        _id: "emp_1",
        name: "John Doe",
        email: "j.doe@company.com",
        employeeId: "EMP-001",
      },
      employeeId: "EMP-001",
      leaveType: "sick",
      startDate: "2025-06-10",
      endDate: "2025-06-11",
      totalDays: 2,
      reason: "Flu symptoms",
      status: "pending",
      createdAt: new Date().toISOString(),
    },
    {
      _id: "leave_2",
      employee: {
        _id: "emp_2",
        name: "Jane Smith",
        email: "j.smith@company.com",
        employeeId: "MGR-001",
      },
      employeeId: "MGR-001",
      leaveType: "vacation",
      startDate: "2025-07-01",
      endDate: "2025-07-05",
      totalDays: 5,
      reason: "Family trip",
      status: "approved",
      createdAt: new Date().toISOString(),
    },
  ];

  const defaultAttendance = [
    {
      _id: "att_1",
      employee: {
        _id: "usr_1",
        name: "John Doe",
        email: "j.doe@company.com",
        employeeId: "EMP-001",
      },
      employeeId: "EMP-001",
      date: new Date().toISOString().split("T")[0],
      checkIn: new Date(new Date().setHours(9, 15, 0, 0)).toISOString(),
      checkOut: new Date(new Date().setHours(18, 30, 0, 0)).toISOString(),
      workingHours: 9.25,
      status: "present",
    },
    {
      _id: "att_2",
      employee: {
        _id: "usr_2",
        name: "Jane Smith",
        email: "j.smith@company.com",
        employeeId: "MGR-001",
      },
      employeeId: "MGR-001",
      date: new Date().toISOString().split("T")[0],
      checkIn: new Date(new Date().setHours(10, 5, 0, 0)).toISOString(),
      workingHours: 0,
      status: "late",
    },
  ];

  if (!localStorage.getItem("hrms_employees")) {
    localStorage.setItem("hrms_employees", JSON.stringify(defaultEmployees));
  }
  if (!localStorage.getItem("hrms_leaves")) {
    localStorage.setItem("hrms_leaves", JSON.stringify(defaultLeaves));
  }
  if (!localStorage.getItem("hrms_attendance")) {
    localStorage.setItem("hrms_attendance", JSON.stringify(defaultAttendance));
  }
};

initializeLocalStorage();

// Response interceptor to intercept network errors and fallback to Mock localStorage DB
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const isNetworkError =
      !error.response ||
      error.code === "ERR_NETWORK" ||
      error.message.includes("Network Error") ||
      error.response.status === 502 ||
      error.response.status === 504;

    if (isNetworkError) {
      const config = error.config;
      const url = config.url || "";
      const method = config.method ? config.method.toLowerCase() : "get";

      let payload = {};
      try {
        payload = config.data ? JSON.parse(config.data) : {};
      } catch (e) {
        // Not JSON
      }

      console.warn(
        `[Offline API Mode] Server down or unreachable. Intercepted: ${method.toUpperCase()} ${url}`,
        payload
      );

      // Local db accessors
      const getEmployees = () => JSON.parse(localStorage.getItem("hrms_employees") || "[]");
      const saveEmployees = (data) => localStorage.setItem("hrms_employees", JSON.stringify(data));
      
      const getLeaves = () => JSON.parse(localStorage.getItem("hrms_leaves") || "[]");
      const saveLeaves = (data) => localStorage.setItem("hrms_leaves", JSON.stringify(data));

      const getAttendance = () => JSON.parse(localStorage.getItem("hrms_attendance") || "[]");
      const saveAttendance = (data) => localStorage.setItem("hrms_attendance", JSON.stringify(data));

      // Router matching
      // 1. LOGIN
      if (url.includes("/auth/login")) {
        const { email, password } = payload;
        if (
          (email === "hr@nexahr.com" && password === "Admin@123") ||
          email === "hr@example.com"
        ) {
          return {
            data: {
              success: true,
              message: "Login successful (Mock)",
              token: "mock-jwt-token-manager",
              user: {
                id: "usr_2",
                employeeId: "MGR-001",
                name: "Jane Smith",
                email: "hr@nexahr.com",
                role: "Manager",
              },
            },
            status: 200,
            statusText: "OK",
            headers: {},
            config,
          };
        } else if (
          email === "employee@nexahr.com" &&
          password === "Admin@123"
        ) {
          return {
            data: {
              success: true,
              message: "Login successful (Mock)",
              token: "mock-jwt-token-employee",
              user: {
                id: "usr_1",
                employeeId: "EMP-001",
                name: "John Doe",
                email: "employee@nexahr.com",
                role: "Employee",
              },
            },
            status: 200,
            statusText: "OK",
            headers: {},
            config,
          };
        } else {
          return Promise.reject({
            response: {
              status: 400,
              data: { success: false, message: "Invalid email or password" },
            },
          });
        }
      }

      // 2. GET EMPLOYEES
      if (url.includes("/employee/get-emp")) {
        const list = getEmployees();
        return {
          data: {
            success: true,
            count: list.length,
            employees: list,
          },
          status: 200,
          statusText: "OK",
          headers: {},
          config,
        };
      }

      // 3. ADD EMPLOYEE
      if (url.includes("/employee/add") && method === "post") {
        const list = getEmployees();
        const nextId = "emp_" + (list.length + 1);
        const prefix = payload.role === "Manager" ? "MGR" : "EMP";
        const empCode = prefix + "-" + String(list.length + 1).padStart(3, "0");

        const newEmp = {
          _id: nextId,
          id: String(list.length + 1),
          employeeId: empCode,
          firstName: payload.firstName,
          lastName: payload.lastName,
          department: payload.department,
          designation: payload.designation,
          joiningDate: payload.joiningDate || new Date().toISOString().split("T")[0],
          phone: payload.phone || "",
          email: payload.email,
          gender: payload.gender || "Other",
          address: payload.address || "",
          basicSalary: Number(payload.basicSalary || 5000),
          bonus: Number(payload.bonus || 0),
          allowance: Number(payload.allowance || 0),
          user: {
            _id: "usr_" + nextId,
            employeeId: empCode,
            name: `${payload.firstName} ${payload.lastName}`,
            email: payload.email,
            role: payload.role,
            isActive: true,
          },
        };

        list.unshift(newEmp); // newest first
        saveEmployees(list);

        return {
          data: {
            success: true,
            message: "Employee created successfully (Mock)",
            user: newEmp.user,
            employee: newEmp,
          },
          status: 201,
          statusText: "Created",
          headers: {},
          config,
        };
      }

      // 4. GET LATEST PENDING LEAVES
      if (url.includes("/leave/latest-pending")) {
        const list = getLeaves().filter((l) => l.status === "pending").slice(0, 5);
        return {
          data: {
            success: true,
            count: list.length,
            leaves: list,
          },
          status: 200,
          statusText: "OK",
          headers: {},
          config,
        };
      }

      // 5. GET ALL LEAVES
      if (url.includes("/leave/all")) {
        const list = getLeaves();
        return {
          data: {
            success: true,
            count: list.length,
            leaves: list,
          },
          status: 200,
          statusText: "OK",
          headers: {},
          config,
        };
      }

      // 6. APPLY LEAVE
      if (url.includes("/leave/apply") && method === "post") {
        const list = getLeaves();
        const start = new Date(payload.startDate);
        const end = new Date(payload.endDate);
        const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        const newLeave = {
          _id: "leave_" + (list.length + 1),
          employee: {
            _id: payload.employee,
            name: "Jane Smith", // mock placeholder or can find in employees
            email: "user@company.com",
            employeeId: "EMP-001",
          },
          employeeId: "EMP-001",
          leaveType: payload.leaveType,
          startDate: payload.startDate,
          endDate: payload.endDate,
          totalDays: diff,
          reason: payload.reason,
          status: "pending",
          createdAt: new Date().toISOString(),
        };

        // Try to enrich employee info from local list
        const emps = getEmployees();
        const matchingEmp = emps.find((e) => e.user?._id === payload.employee || e._id === payload.employee);
        if (matchingEmp) {
          newLeave.employee.name = `${matchingEmp.firstName} ${matchingEmp.lastName}`;
          newLeave.employee.email = matchingEmp.email;
          newLeave.employee.employeeId = matchingEmp.employeeId;
          newLeave.employeeId = matchingEmp.employeeId;
        }

        list.unshift(newLeave);
        saveLeaves(list);

        return {
          data: {
            success: true,
            message: "Leave request submitted successfully (Mock)",
            leave: newLeave,
          },
          status: 201,
          statusText: "Created",
          headers: {},
          config,
        };
      }

      // 7. UPDATE LEAVE STATUS
      if (url.includes("/leave/status/")) {
        const match = url.match(/\/leave\/status\/([^/]+)/);
        const leaveId = match ? match[1] : "";
        const list = getLeaves();
        const index = list.findIndex((l) => l._id === leaveId);

        if (index !== -1) {
          list[index].status = payload.status;
          list[index].managerRemark = payload.managerRemark;
          list[index].approvedBy = payload.approvedBy;
          saveLeaves(list);

          return {
            data: {
              success: true,
              message: `Leave ${payload.status} successfully (Mock)`,
              leave: list[index],
            },
            status: 200,
            statusText: "OK",
            headers: {},
            config,
          };
        }
      }

      // 8. ATTENDANCE CHECK-IN
      if (url.includes("/attendance/checkin") && method === "post") {
        const list = getAttendance();
        const todayStr = new Date().toISOString().split("T")[0];
        
        const existingIndex = list.findIndex(
          (a) => a.employee?._id === payload.employeeId && a.date === todayStr
        );

        if (existingIndex !== -1) {
          return Promise.reject({
            response: {
              status: 400,
              data: { success: false, message: "Already checked in today" },
            },
          });
        }

        const now = new Date();
        const status = now.getHours() >= 10 ? "late" : "present";

        const newAttendance = {
          _id: "att_" + (list.length + 1),
          employee: {
            _id: payload.employeeId,
            name: "John Doe",
            email: "j.doe@company.com",
            employeeId: "EMP-001",
          },
          employeeId: "EMP-001",
          date: todayStr,
          checkIn: now.toISOString(),
          workingHours: 0,
          status,
        };

        // Enrich employee info
        const emps = getEmployees();
        const matchingEmp = emps.find((e) => e.user?._id === payload.employeeId || e._id === payload.employeeId);
        if (matchingEmp) {
          newAttendance.employee.name = `${matchingEmp.firstName} ${matchingEmp.lastName}`;
          newAttendance.employee.email = matchingEmp.email;
          newAttendance.employee.employeeId = matchingEmp.employeeId;
          newAttendance.employeeId = matchingEmp.employeeId;
        }

        list.unshift(newAttendance);
        saveAttendance(list);

        return {
          data: {
            success: true,
            message: "Checked in successfully (Mock)",
            attendance: newAttendance,
          },
          status: 201,
          statusText: "Created",
          headers: {},
          config,
        };
      }

      // 9. ATTENDANCE CHECK-OUT
      if (url.includes("/attendance/checkout") && method === "post") {
        const list = getAttendance();
        const todayStr = new Date().toISOString().split("T")[0];

        const existingIndex = list.findIndex(
          (a) => a.employee?._id === payload.employeeId && a.date === todayStr
        );

        if (existingIndex === -1) {
          return Promise.reject({
            response: {
              status: 404,
              data: { success: false, message: "Attendance record not found" },
            },
          });
        }

        const record = list[existingIndex];
        if (record.checkOut) {
          return Promise.reject({
            response: {
              status: 400,
              data: { success: false, message: "Already checked out today" },
            },
          });
        }

        const checkInTime = new Date(record.checkIn);
        const checkOutTime = new Date();
        const hours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

        record.checkOut = checkOutTime.toISOString();
        record.workingHours = Number(hours.toFixed(2));
        if (hours < 4) {
          record.status = "half_day";
        }

        list[existingIndex] = record;
        saveAttendance(list);

        return {
          data: {
            success: true,
            message: "Checked out successfully (Mock)",
            attendance: record,
          },
          status: 200,
          statusText: "OK",
          headers: {},
          config,
        };
      }

      // 10. GET TODAY ATTENDANCE
      if (url.includes("/attendance/today")) {
        const todayStr = new Date().toISOString().split("T")[0];
        const list = getAttendance().filter((a) => a.date === todayStr);

        return {
          data: {
            success: true,
            count: list.length,
            attendance: list,
          },
          status: 200,
          statusText: "OK",
          headers: {},
          config,
        };
      }

      // 11. GET ATTENDANCE STATS
      if (url.includes("/attendance/stats")) {
        const list = getAttendance();
        const present = list.filter((a) => a.status === "present").length;
        const absent = list.filter((a) => a.status === "absent").length;
        const late = list.filter((a) => a.status === "late").length;
        const onLeave = list.filter((a) => a.status === "on_leave").length;

        return {
          data: {
            success: true,
            stats: {
              present,
              absent,
              late,
              onLeave,
            },
          },
          status: 200,
          statusText: "OK",
          headers: {},
          config,
        };
      }

      // 12. GET EMPLOYEE ATTENDANCE (HISTORY)
      if (url.includes("/attendance/")) {
        const match = url.match(/\/attendance\/([^/]+)$/);
        const empId = match ? match[1] : "";
        const list = getAttendance().filter(
          (a) => a.employee?._id === empId || a.employeeId === empId
        );

        return {
          data: {
            success: true,
            attendance: list,
          },
          status: 200,
          statusText: "OK",
          headers: {},
          config,
        };
      }
    }

    return Promise.reject(error);
  }
);

export default api;