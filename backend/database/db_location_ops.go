package database

import (
	"digital-logbook/models"
	"errors"
	"time"
)

// Location operations
func (db *MockDB) CreateLocation(loc *models.Location) error {
	mu.Lock()
	defer mu.Unlock()

	loc.ID = locationID
	loc.CreatedAt = time.Now()
	locations[locationID] = loc
	locationID++
	return nil
}

func (db *MockDB) GetLocationByID(id uint) (*models.Location, error) {
	mu.RLock()
	defer mu.RUnlock()

	loc, exists := locations[id]
	if !exists {
		return nil, errors.New("location not found")
	}
	return loc, nil
}

func (db *MockDB) GetAllLocations() []*models.Location {
	mu.RLock()
	defer mu.RUnlock()

	result := make([]*models.Location, 0, len(locations))
	for _, loc := range locations {
		result = append(result, loc)
	}
	return result
}

func (db *MockDB) UpdateLocation(loc *models.Location) error {
	mu.Lock()
	defer mu.Unlock()

	if _, exists := locations[loc.ID]; !exists {
		return errors.New("location not found")
	}
	locations[loc.ID] = loc
	return nil
}

func (db *MockDB) DeleteLocation(id uint) error {
	mu.Lock()
	defer mu.Unlock()

	if _, exists := locations[id]; !exists {
		return errors.New("location not found")
	}
	delete(locations, id)
	return nil
}
