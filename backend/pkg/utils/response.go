package utils

import "github.com/gin-gonic/gin"

type APIResponse struct {
	Status  string      `json:"status"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

func JSONResponse(c *gin.Context, statusCode int, message string, data interface{}) {
	response := APIResponse{
		Status:  "success",
		Message: message,
		Data:    data,
	}

	if statusCode >= 400 {
		response.Status = "error"
	}

	c.JSON(statusCode, response)
}
