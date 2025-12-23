package database

import (
	"digital-logbook/models"
	"errors"
	"log"
	"sync"
	"time"

	"golang.org/x/crypto/bcrypt"
)

// In-memory data structures
var (
	users    = make(map[uint]*models.User)
	visitors = make(map[uint]*models.Visitor)
	cargo    = make(map[uint]*models.Cargo)
	fitness       = make(map[uint]*models.FitnessAttendance)
	fitnessMembers = make(map[uint]*models.FitnessMember)
	locations     = make(map[uint]*models.Location)

	userID          uint = 1
	visitorID       uint = 1
	cargoID         uint = 1
	fitnessID       uint = 1
	fitnessMemberID uint = 1
	locationID      uint = 1

	mu sync.RWMutex // Mutex for thread-safe operations
)

// MockDB provides a simple in-memory database interface
type MockDB struct{}

var DB *MockDB

// Initialize sets up the mock database with default data
func Initialize() error {
	DB = &MockDB{}
	seedDefaultData()
	log.Println("Mock database initialized successfully with sample data")
	return nil
}

// seedDefaultData creates default admin user and sample data
func seedDefaultData() {
	mu.Lock()
	defer mu.Unlock()

	// Create default locations
	loc1 := &models.Location{
		ID:        locationID,
		Name:      "Nairobi HQ",
		Code:      "NBO-HQ",
		Address:   "Nairobi, Kenya",
		CreatedAt: time.Now(),
	}
	locations[locationID] = loc1
	locationID++

	loc2 := &models.Location{
		ID:        locationID,
		Name:      "Mombasa Port",
		Code:      "MBA-PORT",
		Address:   "Mombasa, Kenya",
		CreatedAt: time.Now(),
	}
	locations[locationID] = loc2
	locationID++

	// Create default admin user
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
	admin := &models.User{
		ID:           userID,
		Username:     "admin",
		PasswordHash: string(hashedPassword),
		Role:         models.RoleAdmin,
		FullName:     "System Administrator",
		CreatedAt:    time.Now(),
	}
	users[userID] = admin
	userID++

	// Create sample data entry operator
	hashedPassword2, _ := bcrypt.GenerateFromPassword([]byte("data123"), bcrypt.DefaultCost)
	dataEntry := &models.User{
		ID:           userID,
		Username:     "data_entry",
		PasswordHash: string(hashedPassword2),
		Role:         models.RoleDataEntry,
		FullName:     "Data Entry Operator",
		LocationID:   &loc1.ID,
		CreatedAt:    time.Now(),
	}
	users[userID] = dataEntry
	userID++

	// Create sample visitors
	visitor1 := &models.Visitor{
		ID:          visitorID,
		Name:        "John Doe",
		IDNumber:    "12345678",
		AreaOfVisit: "Terminal A",
		CompanyFrom: "ABC Logistics",
		Purpose:     "Cargo inspection",
		Status:      models.StatusSignedIn,
		BadgeNumber: "B001",
		SignInTime:  time.Now().Add(-2 * time.Hour),
		LocationID:  loc1.ID,
		CreatedAt:   time.Now().Add(-2 * time.Hour),
	}
	visitors[visitorID] = visitor1
	visitorID++

	visitor2 := &models.Visitor{
		ID:          visitorID,
		Name:        "Jane Smith",
		IDNumber:    "87654321",
		AreaOfVisit: "Terminal B",
		CompanyFrom: "XYZ Airlines",
		Purpose:     "Meeting with staff",
		Status:      models.StatusSignedOut,
		BadgeNumber: "B002",
		SignInTime:  time.Now().Add(-5 * time.Hour),
		SignOutTime: &[]time.Time{time.Now().Add(-3 * time.Hour)}[0],
		LocationID:  loc2.ID,
		CreatedAt:   time.Now().Add(-5 * time.Hour),
	}
	visitors[visitorID] = visitor2
	visitorID++

	// Create sample cargo
	cargo1 := &models.Cargo{
		ID:                  cargoID,
		AWBNumber:           "AWB123456",
		ULDNumbers:          "AKE12345AA",
		Category:            models.CategoryKnown,
		Description:         "Electronic equipment",
		DriverName:          "Mike Johnson",
		Company:             "Fast Logistics Inc",
		VehicleRegistration: "ABC-1234",
		SealNumber:          "SEAL001",
		LocationID:          loc1.ID,
		CreatedAt:           time.Now().Add(-1 * time.Hour),
	}
	cargo[cargoID] = cargo1
	cargoID++

	log.Println("Default admin user created (username: admin, password: admin123)")
	log.Println("Sample data entry user created (username: data_entry, password: data123)")
	log.Println("⚠️  IMPORTANT: Please change the default passwords after first login!")
}

// User operations
func (db *MockDB) CreateUser(user *models.User) error {
	mu.Lock()
	defer mu.Unlock()

	user.ID = userID
	user.CreatedAt = time.Now()
	users[userID] = user
	userID++
	return nil
}

func (db *MockDB) GetUserByUsername(username string) (*models.User, error) {
	mu.RLock()
	defer mu.RUnlock()

	for _, user := range users {
		if user.Username == username {
			// Populate location data if user has a location
			if user.LocationID != nil {
				if loc, exists := locations[*user.LocationID]; exists {
					user.Location = loc
				}
			}
			return user, nil
		}
	}
	return nil, errors.New("user not found")
}

func (db *MockDB) GetUserByID(id uint) (*models.User, error) {
	mu.RLock()
	defer mu.RUnlock()

	user, exists := users[id]
	if !exists {
		return nil, errors.New("user not found")
	}
	return user, nil
}

func (db *MockDB) GetAllUsers() []*models.User {
	mu.RLock()
	defer mu.RUnlock()

	result := make([]*models.User, 0, len(users))
	for _, user := range users {
		// Populate location data if user has a location
		if user.LocationID != nil {
			if loc, exists := locations[*user.LocationID]; exists {
				user.Location = loc
			}
		}
		result = append(result, user)
	}
	return result
}

func (db *MockDB) UpdateUser(user *models.User) error {
	mu.Lock()
	defer mu.Unlock()

	if _, exists := users[user.ID]; !exists {
		return errors.New("user not found")
	}
	users[user.ID] = user
	return nil
}

func (db *MockDB) DeleteUser(id uint) error {
	mu.Lock()
	defer mu.Unlock()

	if _, exists := users[id]; !exists {
		return errors.New("user not found")
	}
	delete(users, id)
	return nil
}

// Visitor operations
func (db *MockDB) CreateVisitor(visitor *models.Visitor) error {
	mu.Lock()
	defer mu.Unlock()

	visitor.ID = visitorID
	visitor.CreatedAt = time.Now()
	visitors[visitorID] = visitor
	visitorID++
	return nil
}

func (db *MockDB) GetVisitorByID(id uint) (*models.Visitor, error) {
	mu.RLock()
	defer mu.RUnlock()

	visitor, exists := visitors[id]
	if !exists {
		return nil, errors.New("visitor not found")
	}
	return visitor, nil
}

func (db *MockDB) GetAllVisitors(filters map[string]interface{}) []*models.Visitor {
	mu.RLock()
	defer mu.RUnlock()

	result := make([]*models.Visitor, 0, len(visitors))
	for _, visitor := range visitors {
		// Apply filters if provided
		if status, ok := filters["status"].(string); ok {
			if string(visitor.Status) != status {
				continue
			}
		}
		if locationID, ok := filters["location_id"].(uint); ok {
			if visitor.LocationID != locationID {
				continue
			}
		}
		// Populate location data
		if loc, exists := locations[visitor.LocationID]; exists {
			visitor.Location = loc
		}
		result = append(result, visitor)
	}
	return result
}

func (db *MockDB) UpdateVisitor(visitor *models.Visitor) error {
	mu.Lock()
	defer mu.Unlock()

	if _, exists := visitors[visitor.ID]; !exists {
		return errors.New("visitor not found")
	}
	visitors[visitor.ID] = visitor
	return nil
}

func (db *MockDB) DeleteVisitor(id uint) error {
	mu.Lock()
	defer mu.Unlock()

	if _, exists := visitors[id]; !exists {
		return errors.New("visitor not found")
	}
	delete(visitors, id)
	return nil
}

// Cargo operations
func (db *MockDB) CreateCargo(c *models.Cargo) error {
	mu.Lock()
	defer mu.Unlock()

	c.ID = cargoID
	c.CreatedAt = time.Now()
	cargo[cargoID] = c
	cargoID++
	return nil
}

func (db *MockDB) GetCargoByID(id uint) (*models.Cargo, error) {
	mu.RLock()
	defer mu.RUnlock()

	c, exists := cargo[id]
	if !exists {
		return nil, errors.New("cargo not found")
	}
	return c, nil
}

func (db *MockDB) GetAllCargo(filters map[string]interface{}) []*models.Cargo {
	mu.RLock()
	defer mu.RUnlock()

	result := make([]*models.Cargo, 0, len(cargo))
	for _, c := range cargo {
		// Apply filters if provided
		if category, ok := filters["category"].(string); ok {
			if string(c.Category) != category {
				continue
			}
		}
		result = append(result, c)
	}
	return result
}

func (db *MockDB) UpdateCargo(c *models.Cargo) error {
	mu.Lock()
	defer mu.Unlock()

	if _, exists := cargo[c.ID]; !exists {
		return errors.New("cargo not found")
	}
	cargo[c.ID] = c
	return nil
}

func (db *MockDB) DeleteCargo(id uint) error {
	mu.Lock()
	defer mu.Unlock()

	if _, exists := cargo[id]; !exists {
		return errors.New("cargo not found")
	}
	delete(cargo, id)
	return nil
}

// Fitness Member operations
func (db *MockDB) CreateFitnessMember(m *models.FitnessMember) error {
	mu.Lock()
	defer mu.Unlock()

	// Check for duplicate ID number
	for _, member := range fitnessMembers {
		if member.IDNumber == m.IDNumber {
			return errors.New("member with this ID number already exists")
		}
	}

	m.ID = fitnessMemberID
	m.CreatedAt = time.Now()
	fitnessMembers[fitnessMemberID] = m
	fitnessMemberID++
	return nil
}

func (db *MockDB) GetFitnessMemberByID(id uint) (*models.FitnessMember, error) {
	mu.RLock()
	defer mu.RUnlock()

	m, exists := fitnessMembers[id]
	if !exists {
		return nil, errors.New("member not found")
	}
	return m, nil
}

func (db *MockDB) GetAllFitnessMembers() []*models.FitnessMember {
	mu.RLock()
	defer mu.RUnlock()

	result := make([]*models.FitnessMember, 0, len(fitnessMembers))
	for _, m := range fitnessMembers {
		result = append(result, m)
	}
	return result
}

func (db *MockDB) UpdateFitnessMember(m *models.FitnessMember) error {
	mu.Lock()
	defer mu.Unlock()

	if _, exists := fitnessMembers[m.ID]; !exists {
		return errors.New("member not found")
	}
	fitnessMembers[m.ID] = m
	return nil
}

func (db *MockDB) DeleteFitnessMember(id uint) error {
	mu.Lock()
	defer mu.Unlock()

	if _, exists := fitnessMembers[id]; !exists {
		return errors.New("member not found")
	}
	delete(fitnessMembers, id)
	return nil
}

// Fitness Attendance operations
func (db *MockDB) CreateFitnessAttendance(f *models.FitnessAttendance) error {
	mu.Lock()
	defer mu.Unlock()

	f.ID = fitnessID
	f.CreatedAt = time.Now()
	fitness[fitnessID] = f
	fitnessID++
	return nil
}

func (db *MockDB) GetFitnessAttendanceByID(id uint) (*models.FitnessAttendance, error) {
	mu.RLock()
	defer mu.RUnlock()

	f, exists := fitness[id]
	if !exists {
		return nil, errors.New("attendance not found")
	}
	return f, nil
}

func (db *MockDB) GetAllFitnessAttendance(filters map[string]interface{}) []*models.FitnessAttendance {
	mu.RLock()
	defer mu.RUnlock()

	result := make([]*models.FitnessAttendance, 0, len(fitness))
	for _, f := range fitness {
		if session, ok := filters["session"].(string); ok {
			if string(f.Session) != session {
				continue
			}
		}
		if date, ok := filters["date"].(string); ok {
			if f.Date.Format("2006-01-02") != date {
				continue
			}
		}
		// Populate member data
		if member, exists := fitnessMembers[f.MemberID]; exists {
			f.Member = member
		}
		result = append(result, f)
	}
	return result
}

func (db *MockDB) UpdateFitnessAttendance(f *models.FitnessAttendance) error {
	mu.Lock()
	defer mu.Unlock()

	if _, exists := fitness[f.ID]; !exists {
		return errors.New("attendance not found")
	}
	fitness[f.ID] = f
	return nil
}

func (db *MockDB) DeleteFitnessAttendance(id uint) error {
	mu.Lock()
	defer mu.Unlock()

	if _, exists := fitness[id]; !exists {
		return errors.New("attendance not found")
	}
	delete(fitness, id)
	return nil
}

func (db *MockDB) HasAttendance(memberID uint, session models.FitnessSession, date time.Time) bool {
	mu.RLock()
	defer mu.RUnlock()

	for _, f := range fitness {
		if f.MemberID == memberID && f.Session == session && f.Date.Equal(date) {
			return true
		}
	}
	return false
}
