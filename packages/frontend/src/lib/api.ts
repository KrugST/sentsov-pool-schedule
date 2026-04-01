const API_BASE = "/api";

function getToken(): string | null {
  return sessionStorage.getItem("admin_token");
}

export function setToken(token: string) {
  sessionStorage.setItem("admin_token", token);
}

export function clearToken() {
  sessionStorage.removeItem("admin_token");
}

export function hasToken(): boolean {
  return !!getToken();
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) ?? {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  return res.json();
}

// Admin
export async function adminLogin(pin: string) {
  return request<{ token: string }>("/admin/login", {
    method: "POST",
    body: JSON.stringify({ pin }),
  });
}

// Timeslots
export async function getTimeslots(month?: string) {
  const query = month ? `?month=${month}` : "";
  return request<{ data: import("@/types").TimeSlot[] }>(
    `/timeslots${query}`
  );
}

export async function createTimeslot(data: {
  date: string;
  startTime: string;
  endTime: string;
}) {
  return request<{ data: import("@/types").TimeSlot }>("/timeslots", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteTimeslot(id: string) {
  return request<{ success: boolean }>(`/timeslots/${id}`, {
    method: "DELETE",
  });
}

// Bookings
export async function getBookings(month?: string) {
  const query = month ? `?month=${month}` : "";
  return request<{ data: import("@/types").Booking[] }>(
    `/bookings${query}`
  );
}

export async function createBooking(data: {
  slotId: string;
  guestName: string;
  eventName: string;
  description: string;
}) {
  return request<{ data: import("@/types").Booking }>("/bookings", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateBookingStatus(
  id: string,
  status: "approved" | "declined"
) {
  return request<{ data: import("@/types").Booking }>(`/bookings/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function deleteBookingApi(id: string) {
  return request<{ success: boolean }>(`/bookings/${id}`, {
    method: "DELETE",
  });
}
