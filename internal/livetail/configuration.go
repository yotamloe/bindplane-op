package livetail

// configuration represents the "livetail" config sent to the agent via opamp
type configuration struct {
	Sessions []session `json:"sessions"`
	Endpoint string    `json:"endpoint"`
}

type session struct {
	ID      string   `json:"id"`
	Filters []string `json:"filters"`
}
