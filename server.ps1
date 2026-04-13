$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add('http://localhost:8000/')
$listener.Start()

Write-Host 'HTTP server started on port 8000'
Write-Host 'Open http://localhost:8000 in your browser to view the game'

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    try {
        $path = $request.Url.LocalPath
        if ($path -eq '/') {
            $path = '/index.html'
        }

        $filePath = Join-Path -Path $PSScriptRoot -ChildPath $path.TrimStart('/')

        if (Test-Path $filePath -PathType Leaf) {
            $content = Get-Content -Path $filePath -Raw
            $response.ContentType = switch ([System.IO.Path]::GetExtension($filePath)) {
                '.html' { 'text/html' }
                '.css' { 'text/css' }
                '.js' { 'application/javascript' }
                '.png' { 'image/png' }
                '.jpg' { 'image/jpeg' }
                '.gif' { 'image/gif' }
                default { 'application/octet-stream' }
            }
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($content)
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        } else {
            $response.StatusCode = 404
            $content = '<html><body><h1>404 Not Found</h1></body></html>'
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($content)
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        }
    } catch {
        $response.StatusCode = 500
        $content = '<html><body><h1>500 Internal Server Error</h1></body></html>'
        $buffer = [System.Text.Encoding]::UTF8.GetBytes($content)
        $response.ContentLength64 = $buffer.Length
        $response.OutputStream.Write($buffer, 0, $buffer.Length)
    } finally {
        $response.OutputStream.Close()
        $response.Close()
    }
}

$listener.Stop()
$listener.Close()