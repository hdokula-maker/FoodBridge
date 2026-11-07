
import { useEffect, useState } from "react";
import "./App.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const emptyFoodForm = {
  foodName: "",
  description: "",
  quantity: "",
  category: "Vegetarian",
  pickupLocation: "",
  preparedAt: "",
  pickupDeadline: "",
  storageInstructions: ""
};

function App() {
  const [page, setPage] = useState("login");

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [foods, setFoods] = useState([]);
  const [claims, setClaims] = useState([]);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [myFoodSearch, setMyFoodSearch] = useState("");
const [myFoodStatus, setMyFoodStatus] = useState("All");

  const [form, setForm] = useState({ ...emptyFoodForm });

  const [auth, setAuth] = useState({
    name: "",
    email: "",
    password: "",
    role: "restaurant"
  });

  const [adminStats, setAdminStats] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminFoods, setAdminFoods] = useState([]);
  const [adminTab, setAdminTab] = useState("overview");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };

  const loadFoods = async () => {
    try {
      const response = await fetch(`${API}/foods`);
      const data = await response.json();

      if (response.ok) {
        setFoods(data);
      }
    } catch {
      setMessage("Could not load food listings.");
    }
  };

  const loadClaims = async () => {
    try {
      const response = await fetch(`${API}/claims/my-claims`, {
        headers
      });

      const data = await response.json();

      if (response.ok) {
        setClaims(data);
      }
    } catch {
      setMessage("Could not load your claims.");
    }
  };
  
const loadAdminData = async () => {
  setMessage("Refreshing dashboard data...");

  try {
    const [statsResponse, usersResponse, foodsResponse] = await Promise.all([
      fetch(`${API}/admin/stats`, { headers }),
      fetch(`${API}/admin/users`, { headers }),
      fetch(`${API}/admin/foods`, { headers })
    ]);

    const statsData = await statsResponse.json();
    const usersData = await usersResponse.json();
    const foodsData = await foodsResponse.json();

    if (!statsResponse.ok) {
      throw new Error(statsData.message || "Could not load admin statistics.");
    }

    if (!usersResponse.ok) {
      throw new Error(usersData.message || "Could not load users.");
    }

    if (!foodsResponse.ok) {
      throw new Error(foodsData.message || "Could not load food listings.");
    }

    setAdminStats(statsData);
    setAdminUsers(usersData);
    setAdminFoods(foodsData);

    setMessage("Dashboard data refreshed successfully!");
  } catch (error) {
    setMessage(error.message || "Could not refresh dashboard data.");
  }
};


  

  useEffect(() => {
    if (user && token) {
      if (user.role === "admin") {
        loadAdminData();
      } else {
        loadFoods();

        if (user.role === "ngo" || user.role === "volunteer") {
          loadClaims();
        }
      }
    }
  }, [user, token]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setMessage("Please wait...");

    const endpoint = page === "register" ? "register" : "login";

    const body = page === "register"
      ? auth
      : { email: auth.email, password: auth.password };

    try {
      const response = await fetch(`${API}/auth/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Authentication failed.");
        return;
      }

      if (page === "register") {
        setMessage("Registration successful! Please log in.");
        setPage("login");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setToken(data.token);
      setUser(data.user);
      setMessage("");
    } catch {
      setMessage("Unable to connect to the server.");
    }
  };

  const startEdit = (food) => {
    const toLocalDateTime = (value) => {
      const date = new Date(value);

      return new Date(
        date.getTime() - date.getTimezoneOffset() * 60000
      ).toISOString().slice(0, 16);
    };

    setEditingId(food._id);

    setForm({
      foodName: food.foodName,
      description: food.description,
      quantity: String(food.quantity),
      category: food.category,
      pickupLocation: food.pickupLocation,
      preparedAt: toLocalDateTime(food.preparedAt),
      pickupDeadline: toLocalDateTime(food.pickupDeadline),
      storageInstructions: food.storageInstructions || ""
    });

    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ ...emptyFoodForm });
    setMessage("");
  };
  
  const handleAddFood = async (e) => {
    e.preventDefault();

    const isEditing = Boolean(editingId);

    try {
      const response = await fetch(
        isEditing
          ? `${API}/foods/${editingId}`
          : `${API}/foods`,
        {
          method: isEditing ? "PUT" : "POST",
          headers,
          body: JSON.stringify({
            ...form,
            quantity: Number(form.quantity),
            allergens: []
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Could not save food.");
        return;
      }

      setMessage(
        isEditing
          ? "Food donation updated successfully!"
          : "Food donation added successfully!"
      );

      setEditingId(null);
      setForm({ ...emptyFoodForm });

      await loadFoods();
    } catch {
      setMessage("Unable to connect to the server.");
    }
  };

  const handleClaim = async (foodId) => {
    try {
      const response = await fetch(`${API}/claims/${foodId}`, {
        method: "POST",
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Could not claim food.");
        return;
      }

      setMessage("Food claimed successfully!");

      await loadFoods();
      await loadClaims();
    } catch {
      setMessage("Unable to connect to the server.");
    }
  };

  const handleDelete = async (foodId) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) {
      return;
    }

    try {
      const response = await fetch(`${API}/foods/${foodId}`, {
        method: "DELETE",
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Could not delete food.");
        return;
      }

      setMessage("Food listing deleted successfully!");

      await loadFoods();
    } catch {
      setMessage("Unable to connect to the server.");
    }
  };

  const handleAdminDelete = async (foodId) => {
    if (!window.confirm("Admin action: permanently delete this food listing?")) {
      return;
    }

    try {
      const response = await fetch(`${API}/admin/foods/${foodId}`, {
        method: "DELETE",
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Could not delete food listing.");
        return;
      }

      setMessage("Food listing deleted successfully by admin.");
      await loadAdminData();
    } catch {
      setMessage("Unable to connect to the server.");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken("");
    setUser(null);
    setPage("login");
    setFoods([]);
    setClaims([]);
    setMessage("");
    setEditingId(null);
    setForm({ ...emptyFoodForm });
    setSearchTerm("");
    setCategoryFilter("All");
    setAdminStats(null);
    setAdminUsers([]);
    setAdminFoods([]);
    setAdminTab("overview");
  };

  const myFoods = foods.filter(
    (food) => food.postedBy?._id === user?.id
  );

  const availableFoods = foods.filter(
    (food) => food.status === "Available"
  );
  const myAvailableFoods = myFoods.filter(
  (food) => food.status === "Available"
);

const myClaimedFoods = myFoods.filter(
  (food) => food.status === "Claimed"
);

const filteredMyFoods = myFoods.filter((food) => {
  const matchesSearch = food.foodName
    .toLowerCase()
    .includes(myFoodSearch.toLowerCase());

  const matchesStatus =
    myFoodStatus === "All" || food.status === myFoodStatus;

  return matchesSearch && matchesStatus;
});

  const filteredFoods = availableFoods.filter((food) => {
    const matchesSearch = food.foodName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "All" ||
      food.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  if (!user || !token) {
    return (
      <div className="auth-page">
        <nav className="navbar">
          <h2>🌿 FoodBridge</h2>
          <span>Share Food. Spread Hope.</span>
        </nav>

        <main className="auth-container">
          <section className="auth-info">
            <h1>Good Food Should Never Go to Waste.</h1>

            <p>
              FoodBridge connects restaurants, NGOs and volunteers
              to redistribute surplus food to people in need.
            </p>

            <div className="leaf">🥗</div>
          </section>

          <section className="auth-card">
            <h2>
              {page === "login" ? "Welcome Back!" : "Create Account"}
            </h2>

            <p>Join us in making a difference.</p>

            <form onSubmit={handleAuth}>
              {page === "register" && (
                <>
                  <label>Full Name</label>

                  <input
                    value={auth.name}
                    onChange={(e) =>
                      setAuth({ ...auth, name: e.target.value })
                    }
                    placeholder="Enter your name"
                    required
                  />

                  <label>I am a</label>

                  <select
                    value={auth.role}
                    onChange={(e) =>
                      setAuth({ ...auth, role: e.target.value })
                    }
                  >
                    <option value="restaurant">Restaurant</option>
                    <option value="ngo">NGO</option>
                    <option value="volunteer">Volunteer</option>
                  </select>
                </>
              )}

              <label>Email Address</label>

              <input
                type="email"
                value={auth.email}
                onChange={(e) =>
                  setAuth({ ...auth, email: e.target.value })
                }
                placeholder="Enter your email"
                required
              />

              <label>Password</label>

              <input
                type="password"
                value={auth.password}
                onChange={(e) =>
                  setAuth({ ...auth, password: e.target.value })
                }
                placeholder="Enter your password"
                required
              />
              
              <button type="submit">
                {page === "login" ? "Login" : "Register"}
              </button>
            </form>

            {message && <p className="message">{message}</p>}

            <p className="switch-text">
              {page === "login"
                ? "Don't have an account?"
                : "Already registered?"}

              <button
                className="switch-button"
                onClick={() => {
                  setPage(page === "login" ? "register" : "login");
                  setMessage("");
                }}
              >
                {page === "login" ? " Register" : " Login"}
              </button>
            </p>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className={`dashboard ${user.role}-dashboard`}>
      <nav className="navbar dashboard-navbar">
        <h2>🌿 FoodBridge</h2>

        <div className="nav-right">
          <span>{user.name} · {user.role}</span>

          <button className="logout-button" onClick={logout}>
            Logout
          </button>
        </div>
      </nav>

      <main className="dashboard-main">
        {user.role === "admin" ? (
          <AdminDashboard
            stats={adminStats}
            users={adminUsers}
            foods={adminFoods}
            activeTab={adminTab}
            setActiveTab={setAdminTab}
            onDelete={handleAdminDelete}
            onRefresh={loadAdminData}
          />
        ) : (
          <>
            <div className="dashboard-heading">
  <span className="eyebrow">FOODBRIDGE COMMUNITY</span>

  <h1>
    {user.role === "restaurant" && "Restaurant Dashboard"}
    {user.role === "ngo" && "NGO Dashboard"}
    {user.role === "volunteer" && "Volunteer Dashboard"}
  </h1>

  <p className="welcome-text">
    Welcome, {user.name}! Let's reduce food waste together.
  </p>
</div>

            {message && <p className="message">{message}</p>}

            {user.role === "restaurant" && (
              <>
              <section className="stats-row restaurant-stats">
  <div className="stat-card">
    <h3>{myFoods.length}</h3>
    <p>Total Donations</p>
  </div>

  <div className="stat-card">
    <h3>{myAvailableFoods.length}</h3>
    <p>Available Donations</p>
  </div>

  <div className="stat-card">
    <h3>{myClaimedFoods.length}</h3>
    <p>Claimed Donations</p>
  </div>
</section>
                <section className="dashboard-card">
                  <h2>
                    {editingId ? "Edit Food Donation" : "Add a Food Donation"}
                  </h2>

                  <form className="food-form" onSubmit={handleAddFood}>
                    <input
                      placeholder="Food name"
                      value={form.foodName}
                      onChange={(e) =>
                        setForm({ ...form, foodName: e.target.value })
                      }
                      required
                    />

                    <textarea
                      placeholder="Description"
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                      required
                    />

                    <input
                      type="number"
                      min="1"
                      placeholder="Quantity"
                      value={form.quantity}
                      onChange={(e) =>
                        setForm({ ...form, quantity: e.target.value })
                      }
                      required
                    />

                    <select
                      value={form.category}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                      }
                    >
                      <option>Vegetarian</option>
                      <option>Non-Vegetarian</option>
                      <option>Vegan</option>
                      <option>Bakery</option>
                      <option>Other</option>
                    </select>

                    <input
                      placeholder="Pickup location"
                      value={form.pickupLocation}
                      onChange={(e) =>
                        setForm({ ...form, pickupLocation: e.target.value })
                      }
                      required
                    />

                    <label>Prepared at</label>

                    <input
                      type="datetime-local"
                      value={form.preparedAt}
                      onChange={(e) =>
                        setForm({ ...form, preparedAt: e.target.value })
                      }
                      required
                    />

                    <label>Pickup deadline</label>

                    <input
                      type="datetime-local"
                      value={form.pickupDeadline}
                      onChange={(e) =>
                        setForm({ ...form, pickupDeadline: e.target.value })
                      }
                      required
                    />

                    <input
                      placeholder="Storage instructions"
                      value={form.storageInstructions}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          storageInstructions: e.target.value
                        })
                      }
                    />

                    <button type="submit">
                      {editingId ? "Update Donation" : "Add Donation"}
                    </button>

                    {editingId && (
                      <button
                        type="button"
                        className="delete-button"
                        onClick={cancelEdit}
                      >
                        Cancel Edit
                      </button>
                    )}
                  </form>
                </section>

                <section className="dashboard-card">
  <h2>My Food Donations ({myFoods.length})</h2>

  <div className="search-filters food-filters">
    <input
      type="text"
      placeholder="Search your donations..."
      value={myFoodSearch}
      onChange={(e) => setMyFoodSearch(e.target.value)}
    />

    <select
      value={myFoodStatus}
      onChange={(e) => setMyFoodStatus(e.target.value)}
    >
      <option value="All">All Donations</option>
      <option value="Available">Available</option>
      <option value="Claimed">Claimed</option>
    </select>
  </div>

  <FoodList
    foods={filteredMyFoods}
    onDelete={handleDelete}
    onEdit={startEdit}
  />

  {filteredMyFoods.length === 0 && (
    <p>No matching donations found.</p>
  )}
</section>
              </>
            )}

            {(user.role === "ngo" || user.role === "volunteer") && (
              <>
                <section className="stats-row ngo-stats">
  <div className="stat-card">
    <h3>{availableFoods.length}</h3>
    <p>Available Donations</p>
  </div>

  <div className="stat-card">
    <h3>{claims.length}</h3>
    <p>My Claims</p>
  </div>

  <div className="stat-card">
    <h3>
      {claims.filter((claim) => claim.claimStatus === "Approved").length}
    </h3>
    <p>Approved Claims</p>
  </div>
</section>

                <section className="dashboard-card">
                  <h2>Available Food Donations</h2>

                  <div className="search-filters">
                    <input
                      type="text"
                      placeholder="Search food by name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      <option value="All">All Categories</option>
                      <option value="Vegetarian">Vegetarian</option>
                      <option value="Non-Vegetarian">Non-Vegetarian</option>
                      <option value="Vegan">Vegan</option>
                      <option value="Bakery">Bakery</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <FoodList
                    foods={filteredFoods}
                    onClaim={handleClaim}
                  />

                  
                </section>

                <section className="dashboard-card">
                  <h2>My Claimed Donations</h2>

                  {claims.length === 0 ? (
                    <p>No claims yet.</p>
                  ) : (
                    claims.map((claim) => (
                      <div className="food-item" key={claim._id}>
                        <h3>
                          {claim.foodListing?.foodName || "Food listing"}
                        </h3>

                        <p>Claim status: {claim.claimStatus}</p>

                        <p>
                          Claimed on:{" "}
                          {new Date(claim.claimedAt).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </section>
              </>
            )}
          </>
        )}

        {message && user.role === "admin" && (
          <p className="message">{message}</p>
        )}
      </main>
    </div>
  );
}

function AdminDashboard({
  stats,
  users,
  foods,
  activeTab,
  setActiveTab,
  onDelete,
  onRefresh
}) {
  return (
    <>
      <div className="dashboard-heading admin-heading">
  <span className="eyebrow">PLATFORM CONTROL CENTER</span>
  <h1>Admin Dashboard</h1>
  <p className="welcome-text">
    Welcome, FoodBridge Admin! Manage users and monitor food donations.
  </p>
</div>

      <div className="admin-tabs">
        <button
          className={activeTab === "overview" ? "admin-tab active" : "admin-tab"}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={activeTab === "users" ? "admin-tab active" : "admin-tab"}
          onClick={() => setActiveTab("users")}
        >
          Manage Users
        </button>
        <button
          className={activeTab === "foods" ? "admin-tab active" : "admin-tab"}
          onClick={() => setActiveTab("foods")}
        >
          Manage Donations
        </button>
        <button className="admin-tab" onClick={onRefresh}>
          Refresh Data
        </button>
      </div>

      {!stats ? (
        <section className="dashboard-card">
          <p>Loading admin dashboard...</p>
        </section>
      ) : (
        <>
          {activeTab === "overview" && (
            <>
              <section className="stats-row admin-stats">
                <div className="stat-card">
                  <h3>{stats.totalUsers}</h3>
                  <p>Total Registered Users</p>
                </div>
                <div className="stat-card">
                  <h3>{stats.totalDonations}</h3>
                  <p>Total Food Donations</p>
                </div>
                <div className="stat-card">
                  <h3>{stats.availableDonations}</h3>
                  <p>Available Donations</p>
                </div>
                <div className="stat-card">
                  <h3>{stats.claimedDonations}</h3>
                  <p>Claimed Donations</p>
                </div>
                <div className="stat-card">
                  <h3>{stats.totalClaims}</h3>
                  <p>Total Claims</p>
                </div>
              </section>

              <section className="dashboard-card">
                <h2>Platform Summary</h2>
                <p>
                  FoodBridge currently has {stats.totalUsers} registered users
                  and {stats.totalDonations} food donation listings.
                </p>
                <p>
                  {stats.availableDonations} donations are available and{" "}
                  {stats.claimedDonations} have been claimed.
                </p>
                <p>
                  A total of {stats.totalClaims} claims have been recorded.
                </p>
              </section>
            </>
          )}
          
          {activeTab === "users" && (
            <section className="dashboard-card">
              <h2>Registered Users ({users.length})</h2>
              {users.length === 0 ? (
                <p>No registered users found.</p>
              ) : (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Registered</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((item) => (
                        <tr key={item._id}>
                          <td>{item.name}</td>
                          <td>{item.email}</td>
                          <td>
                            <span className={`role-label ${item.role}`}>
                              {item.role}
                            </span>
                          </td>
                          <td>
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleDateString()
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {activeTab === "foods" && (
            <section className="dashboard-card">
              <h2>All Food Donations ({foods.length})</h2>
              {foods.length === 0 ? (
                <p>No food donations found.</p>
              ) : (
                <div className="food-grid">
                  {foods.map((food) => (
                    <article className="food-item" key={food._id}>
                      <span className={`status ${food.status.toLowerCase()}`}>
                        {food.status}
                      </span>
                      <h3>{food.foodName}</h3>
                      <p>{food.description}</p>
                      <p>
                        <strong>Quantity:</strong> {food.quantity}
                      </p>
                      <p>
                        <strong>Category:</strong> {food.category}
                      </p>
                      <p>
                        <strong>Pickup:</strong> {food.pickupLocation}
                      </p>
                      <p>
                        <strong>Donor:</strong>{" "}
                        {food.postedBy?.name || "Unknown"}
                      </p>
                      <p>
                        <strong>Claimed by:</strong>{" "}
                        {food.claimedBy?.name || "Not claimed"}
                      </p>
                      <button
                        className="delete-button"
                        onClick={() => onDelete(food._id)}
                      >
                        Delete Listing
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}
        </>
      )}
    </>
  );
}

function FoodList({ foods, onClaim, onDelete, onEdit }) {
  if (foods.length === 0) {
    return <p>No food listings to display yet.</p>;
  }

  return (
    <div className="food-grid">
      {foods.map((food) => (
        <article className="food-item" key={food._id}>
          <span className={`status ${food.status.toLowerCase()}`}>
            {food.status}
          </span>

          <h3>{food.foodName}</h3>

          <p>{food.description}</p>

          <p>
            <strong>Quantity:</strong> {food.quantity}
          </p>

          <p>
            <strong>Category:</strong> {food.category}
          </p>

          <p>
            <strong>Pickup:</strong> {food.pickupLocation}
          </p>

          <p>
            <strong>Deadline:</strong>{" "}
            {new Date(food.pickupDeadline).toLocaleString()}
          </p>

          {food.postedBy?.name && (
            <p>
              <strong>Donor:</strong> {food.postedBy.name}
            </p>
          )}

          {onClaim && food.status === "Available" && (
            <button onClick={() => onClaim(food._id)}>
              Claim Food
            </button>
          )}

          {onEdit && food.status === "Available" && (
            <button onClick={() => onEdit(food)}>
              Edit Listing
            </button>
          )}

          {onDelete && (
            <button
              className="delete-button"
              onClick={() => onDelete(food._id)}
            >
              Delete Listing
            </button>
          )}
        </article>
      ))}
    </div>
  );
}

export default App;




