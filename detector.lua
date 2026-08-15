-- Kronos Identity Detector
-- This file is intended to be fetched by the main client test script.
-- It contains only non-sensitive test configuration and comparison logic.

return {
    Version = "1.0.0",

    SpoofTest = {
        Username = "SpoofedUsername6969",
        UserId = 666699996699,
        DisplayName = "Spoofmaster67HuBhai"
    },

    Compare = function(authoritative, observed)
        if type(authoritative) ~= "table" or type(observed) ~= "table" then
            return false, "Invalid identity data"
        end

        local idMatch = tostring(authoritative.UserId) == tostring(observed.UserId)
        local nameMatch = tostring(authoritative.Username) == tostring(observed.Username)
        local displayMatch = tostring(authoritative.DisplayName) == tostring(observed.DisplayName)

        if idMatch and nameMatch and displayMatch then
            return true, "IDENTITY MATCH"
        end

        local mismatches = {}

        if not idMatch then
            table.insert(mismatches, "UserId")
        end

        if not nameMatch then
            table.insert(mismatches, "Username")
        end

        if not displayMatch then
            table.insert(mismatches, "DisplayName")
        end

        return false, "MISMATCH: " .. table.concat(mismatches, ", ")
    end
