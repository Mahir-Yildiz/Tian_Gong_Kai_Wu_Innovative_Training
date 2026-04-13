$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add('http://localhost:8080/')
$listener.Start()

Write-Host 'HTTP server started on port 8080'
Write-Host 'Open http://localhost:8080 in your browser to view the game'

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response
    
    $path = $request.Url.LocalPath
    if ($path -eq '/') {
        $path = '/index.html'
    }
    
    $filePath = Join-Path -Path (Get-Location).Path -ChildPath $path.TrimStart('/')
    
    if (Test-Path -Path $filePath -PathType Leaf) {
        $content = Get-Content -Path $filePath -Encoding UTF8 -Raw
        $response.ContentType = 'text/html'
        
        if ($filePath.EndsWith('.js')) {
            $response.ContentType = 'application/javascript'
        } elseif ($filePath.EndsWith('.css')) {
            $response.ContentType = 'text/css'
        }
        
        $buffer = [System.Text.Encoding]::UTF8.GetBytes($content)
        $response.ContentLength64 = $buffer.Length
        $response.OutputStream.Write($buffer, 0, $buffer.Length)
    } else {
        $response.StatusCode = 404
        $content = '404 Not Found'
        $buffer = [System.Text.Encoding]::UTF8.GetBytes($content)
        $response.ContentLength64 = $buffer.Length
        $response.OutputStream.Write($buffer, 0, $buffer.Length)
    }
    
    $response.Close()
}

$listener.Stop()
$listener.Close()