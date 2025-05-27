const API_BASE_URL = "https://tservice.pythonanywhere.com/api/taccount"

export interface User {
  id: number
  username: string
  email: string
  first_name?: string
  last_name?: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}

class ApiClient {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("auth_token")
    return token ? { Authorization: `Token ${token}` } : {}
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.message || "An error occurred")
    }
    return response.json()
  }

  async register(userData: {
    username: string
    email: string
    password: string
    first_name?: string
    last_name?: string
    phone_number?: string
  }) {
    const response = await fetch(`${API_BASE_URL}/register/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })
    
    const data = await response.json()
    
    if (response.ok) {
      return { success: true, message: "Registration successful" }
    } else {
      throw new Error(data.error || data.message || "Registration failed")
    }
  }

  async login(credentials: { username: string; password: string }) {
    const response = await fetch(`${API_BASE_URL}/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    })
    return this.handleResponse<LoginResponse>(response)
  }

  async getProfile() {
    const response = await fetch(`${API_BASE_URL}/profile/`, {
      headers: {
        ...this.getAuthHeaders(),
      },
    })
    return this.handleResponse<User>(response)
  }

  async updateProfile(userData: Partial<User>) {
    const response = await fetch(`${API_BASE_URL}/profile/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(userData),
    })
    return this.handleResponse<User>(response)
  }

  async requestPasswordReset(email: string) {
    const response = await fetch(`${API_BASE_URL}/password-reset-request/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    })
    return this.handleResponse<{ message: string }>(response)
  }

  async confirmPasswordReset(data: {
    token: string
    password: string
  }) {
    const response = await fetch(`${API_BASE_URL}/password-reset-confirm/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    return this.handleResponse<{ message: string }>(response)
  }

  async verifyEmail(token: string) {
    const response = await fetch(`${API_BASE_URL}/verify-email/?token=${token}`)
    return this.handleResponse<{ message: string }>(response)
  }
}

export const apiClient = new ApiClient()
