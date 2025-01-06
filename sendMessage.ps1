$pipeName = '\\.\pipe\myNamedPipe'

function Send-NamedPipeMessage {
    param(
        [string]$Message
    )

    $pipeClient = new-object System.IO.Pipes.NamedPipeClientStream('.', 'myNamedPipe', 'Out')
    $pipeClient.Connect(5000)  # Timeout after 5 seconds

    $streamWriter = new-object System.IO.StreamWriter($pipeClient)
    $streamWriter.AutoFlush = $true

    $data = @{
        text = $Message
        timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    } | ConvertTo-Json

    $streamWriter.WriteLine($data)

    $streamWriter.Dispose()
    $pipeClient.Dispose()
}

# Example usage
Send-NamedPipeMessage "Hello from PowerShell!"