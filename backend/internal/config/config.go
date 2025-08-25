package config

import "os"

type Config struct {
	Port     string
	GinMode  string
	DataPath string
}

func Load() *Config {
	return &Config{
		Port:     getEnv("PORT", "8080"),
		GinMode:  getEnv("GIN_MODE", "debug"),
		DataPath: getEnv("DATA_PATH", "/app/data"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
