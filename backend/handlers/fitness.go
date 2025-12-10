package handlers

import (
	"digital-logbook/database"
	"digital-logbook/models"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type CreateMemberRequest struct {
	Name        string `json:"name" binding:"required"`
	IDNumber    string `json:"id_number" binding:"required"`
	PhoneNumber string `json:"phone_number" binding:"required"`
	Company     string `json:"company" binding:"required"`
}

type CheckInRequest struct {
	MemberID uint                  `json:"member_id" binding:"required"`
	Session  models.FitnessSession `json:"session" binding:"required,oneof=morning afternoon evening"`
}

type CheckOutRequest struct {
	AttendanceID uint `json:"attendance_id" binding:"required"`
}

// Member handlers
func CreateMember(c *gin.Context) {
	var req CreateMemberRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	member := &models.FitnessMember{
		Name:        req.Name,
		IDNumber:    req.IDNumber,
		PhoneNumber: req.PhoneNumber,
		Company:     req.Company,
	}

	if err := database.DB.CreateFitnessMember(member); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create member"})
		return
	}

	c.JSON(http.StatusCreated, member)
}

func ListMembers(c *gin.Context) {
	members := database.DB.GetAllFitnessMembers()
	c.JSON(http.StatusOK, members)
}

func GetMember(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	member, err := database.DB.GetFitnessMemberByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Member not found"})
		return
	}

	c.JSON(http.StatusOK, member)
}

func UpdateMember(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	member, err := database.DB.GetFitnessMemberByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Member not found"})
		return
	}

	var req CreateMemberRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	member.Name = req.Name
	member.IDNumber = req.IDNumber
	member.PhoneNumber = req.PhoneNumber
	member.Company = req.Company

	if err := database.DB.UpdateFitnessMember(member); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update member"})
		return
	}

	c.JSON(http.StatusOK, member)
}

func DeleteMember(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	if err := database.DB.DeleteFitnessMember(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete member"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Member deleted successfully"})
}

// Attendance handlers
func CheckIn(c *gin.Context) {
	var req CheckInRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	now := time.Now()
	date := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())

	// Check for duplicate
	if database.DB.HasAttendance(req.MemberID, req.Session, date) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Already checked in for this session today"})
		return
	}

	attendance := &models.FitnessAttendance{
		MemberID: req.MemberID,
		Session:  req.Session,
		Date:     date,
		CheckIn:  now,
	}

	if err := database.DB.CreateFitnessAttendance(attendance); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check in"})
		return
	}

	// Load member details
	attendance.Member, _ = database.DB.GetFitnessMemberByID(req.MemberID)

	c.JSON(http.StatusCreated, attendance)
}

func CheckOut(c *gin.Context) {
	var req CheckOutRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	attendance, err := database.DB.GetFitnessAttendanceByID(req.AttendanceID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Attendance not found"})
		return
	}

	if attendance.CheckOut != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Already checked out"})
		return
	}

	now := time.Now()
	attendance.CheckOut = &now

	if err := database.DB.UpdateFitnessAttendance(attendance); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check out"})
		return
	}

	c.JSON(http.StatusOK, attendance)
}

// ListFitnessAttendance returns all gym attendance with optional filtering
func ListFitnessAttendance(c *gin.Context) {
	filters := make(map[string]interface{})

	// Filter by session if provided
	session := c.Query("session")
	if session != "" {
		filters["session"] = session
	}

	// Filter by date if provided
	date := c.Query("date")
	if date != "" {
		filters["date"] = date
	}

	attendances := database.DB.GetAllFitnessAttendance(filters)
	c.JSON(http.StatusOK, attendances)
}

// GetFitnessAttendance returns a specific attendance by ID
func GetFitnessAttendance(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	attendance, err := database.DB.GetFitnessAttendanceByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Attendance not found"})
		return
	}

	c.JSON(http.StatusOK, attendance)
}

// DeleteFitnessAttendance deletes an attendance entry (admin only)
func DeleteFitnessAttendance(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	if err := database.DB.DeleteFitnessAttendance(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete attendance"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Attendance deleted successfully"})
}
