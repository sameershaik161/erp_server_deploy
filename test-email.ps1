# Test Email Configuration Script
# Replace YOUR_ADMIN_TOKEN with your actual admin JWT token after logging in

$adminToken = "YOUR_ADMIN_TOKEN_HERE"
$testEmailAddress = "your-email@gmail.com"

$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $adminToken"
}

$body = @{
    testEmail = $testEmailAddress
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/test-email" -Method POST -Headers $headers -Body $body
    Write-Host "✅ SUCCESS: $($response.message)" -ForegroundColor Green
    Write-Host "Sent to: $($response.sentTo)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host $_.Exception.Response
}
